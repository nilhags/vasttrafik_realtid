import targets from "../../config/source-targets.json";
import {
  inferCoordinatesFromTexts,
  isRelevantForKarlskogaArea,
} from "../../shared/locationCatalog";
import { supabase } from "../lib/supabase";
import type { JobUpsertRow, SourceRunResult } from "../lib/types";

type VarbiTarget = {
  host: string;
  employer: string;
  region?: string;
};

type RssItem = {
  title: string | null;
  link: string | null;
  guid: string | null;
  description: string | null;
  pubDate: string | null;
};

function decodeXml(text: string) {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(text: string | null) {
  if (!text) {
    return null;
  }

  return decodeXml(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

function parseRss(xml: string): RssItem[] {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi));

  return items.map((match) => {
    const item = match[1];
    return {
      title: stripHtml(extractTag(item, "title")),
      link: stripHtml(extractTag(item, "link")),
      guid: stripHtml(extractTag(item, "guid")),
      description: stripHtml(extractTag(item, "description")),
      pubDate: stripHtml(extractTag(item, "pubDate")),
    };
  });
}

function extractLocation(description: string | null, fallbackRegion: string | null | undefined) {
  if (!description) {
    return fallbackRegion ?? null;
  }

  const patterns = [
    /Ort\s*[|:]\s*([^|]+?)(?:\s+[A-ZÅÄÖ][a-zåäö]+?\s*[|:]|$)/i,
    /City\s*[|:]\s*([^|]+?)(?:\s+[A-ZÅÄÖ][a-zåäö]+?\s*[|:]|$)/i,
    /Placering\s*[|:]\s*([^|]+?)(?:\s+[A-ZÅÄÖ][a-zåäö]+?\s*[|:]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return fallbackRegion ?? null;
}

function mapItem(item: RssItem, target: VarbiTarget): JobUpsertRow | null {
  const description = item.description;
  const location = extractLocation(description, target.region);
  const coordinates = inferCoordinatesFromTexts(location, target.region);
  const remoteMode = /distans|remote|hybrid/i.test(
    [item.title, description, location].filter(Boolean).join(" "),
  )
    ? /hybrid/i.test([item.title, description, location].filter(Boolean).join(" "))
      ? "Hybrid"
      : "Distans"
    : "På plats";

  if (!item.link && !item.guid) {
    return null;
  }

  return {
    external_id: item.guid ?? item.link ?? `${target.host}:${item.title}`,
    source_name: `Varbi:${target.host}`,
    title: item.title ?? "Okänd titel",
    employer: target.employer,
    location_name: location,
    region: target.region ?? null,
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lon ?? null,
    remote_mode: remoteMode,
    employment_type: null,
    seniority: null,
    language_requirements: null,
    salary_text: null,
    description,
    original_url: item.link,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    application_deadline: null,
    fetched_at: new Date().toISOString(),
  };
}

async function fetchVarbiFeed(target: VarbiTarget) {
  const url = `https://${target.host}/what:rssfeed/`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Varbi ${target.host} ${response.status}`);
  }

  return response.text();
}

export async function fetchVarbiJobs(): Promise<SourceRunResult> {
  const varbiTargets = targets.varbi as VarbiTarget[];
  let fetched = 0;
  let written = 0;

  for (const target of varbiTargets) {
    const sourceName = `Varbi:${target.host}`;
    const xml = await fetchVarbiFeed(target);
    const items = parseRss(xml);
    const rows = items
      .map((item) => mapItem(item, target))
      .filter((job): job is JobUpsertRow => Boolean(job))
      .filter((job) => isRelevantForKarlskogaArea(job.location_name, job.remote_mode, job.region));

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("source_name", sourceName);

    if (deleteError) {
      console.error(`Varbi ${target.host} delete: ${deleteError.message}`);
      continue;
    }

    if (rows.length === 0) {
      console.log(`Varbi ${target.host}: 0 relevanta jobb.`);
      continue;
    }

    const { data, error } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "source_name,external_id" })
      .select("id");

    if (error) {
      console.error(`Varbi ${target.host}: ${error.message}`);
      continue;
    }

    fetched += rows.length;
    written += data?.length ?? 0;
    console.log(`Varbi ${target.host}: ${rows.length} hämtade, ${data?.length ?? 0} skrivna.`);
  }

  return {
    source: "Varbi",
    fetched,
    written,
  };
}
