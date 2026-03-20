import { supabase } from "../lib/supabase";
import type { JobUpsertRow, SourceRunResult } from "../lib/types";

const AF_BASE = "https://jobsearch.api.jobtechdev.se";
const PAGE_SIZE = 100;
const MAX_OFFSET = 2000;

const GEO_LAT = 59.3267;
const GEO_LON = 14.5208;
const GEO_RADIUS = 100;

type AfHit = {
  id: string;
  headline: string;
  description?: { text?: string };
  employer?: { name?: string };
  workplace_address?: {
    municipality?: string;
    region?: string;
    coordinates?: [number, number];
  };
  working_hours_type?: { label?: string };
  salary_description?: string | null;
  salary_type?: { label?: string };
  application_deadline?: string;
  publication_date?: string;
  webpage_url?: string;
  experience_required?: boolean;
  scope_of_work?: { min?: number; max?: number };
};

function remoteMode(hit: AfHit): string | null {
  const text = [hit.headline, hit.description?.text ?? ""].join(" ").toLowerCase();
  if (text.includes("remote") || text.includes("distans")) return "Distans";
  if (text.includes("hybrid")) return "Hybrid";
  return "På plats";
}

function seniority(hit: AfHit): string | null {
  if (hit.experience_required === false) return "Ingen erfarenhet";
  const text = [hit.headline, hit.description?.text ?? ""].join(" ").toLowerCase();
  if (text.includes("senior")) return "Senior";
  if (text.includes("junior")) return "Junior";
  return null;
}

function employmentType(hit: AfHit): string | null {
  const scope = hit.scope_of_work;
  if (scope?.min != null && scope.min < 100) return "Deltid";
  const label = hit.working_hours_type?.label?.toLowerCase() ?? "";
  if (label.includes("deltid")) return "Deltid";
  return "Heltid";
}

function mapHitToRow(hit: AfHit): JobUpsertRow {
  return {
    external_id: hit.id,
    source_name: "Arbetsförmedlingen",
    title: hit.headline,
    employer: hit.employer?.name ?? "Okänd arbetsgivare",
    location_name: hit.workplace_address?.municipality ?? null,
    region: hit.workplace_address?.region ?? null,
    latitude: hit.workplace_address?.coordinates?.[1] ?? null,
    longitude: hit.workplace_address?.coordinates?.[0] ?? null,
    remote_mode: remoteMode(hit),
    employment_type: employmentType(hit),
    seniority: seniority(hit),
    salary_text: hit.salary_description ?? hit.salary_type?.label ?? null,
    description: hit.description?.text?.slice(0, 4000) ?? null,
    original_url: hit.webpage_url ?? null,
    published_at: hit.publication_date ?? null,
    application_deadline: hit.application_deadline ?? null,
    fetched_at: new Date().toISOString(),
  };
}

async function fetchPage(offset: number): Promise<AfHit[]> {
  const url =
    `${AF_BASE}/search?position=${GEO_LAT},${GEO_LON}` +
    `&position.radius=${GEO_RADIUS}&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`AF API ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return json.hits as AfHit[];
}

export async function fetchArbetsformedlingenJobs(): Promise<SourceRunResult> {
  let fetched = 0;
  let written = 0;

  console.log(`Hämtar Arbetsförmedlingen (${GEO_RADIUS} km runt Karlskoga)...`);

  for (let offset = 0; offset <= MAX_OFFSET; offset += PAGE_SIZE) {
    const page = offset / PAGE_SIZE + 1;
    const hits = await fetchPage(offset);

    if (hits.length === 0) {
      console.log(`Arbetsförmedlingen sida ${page}: inga fler träffar.`);
      break;
    }

    const rows = hits.map(mapHitToRow);

    const { data, error } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "source_name,external_id" })
      .select("id");

    if (error) {
      console.error(`Arbetsförmedlingen sida ${page}: ${error.message}`);
      continue;
    }

    fetched += hits.length;
    written += data?.length ?? 0;

    console.log(
      `Arbetsförmedlingen sida ${page}: ${hits.length} hämtade, ${data?.length ?? 0} skrivna.`,
    );
  }

  return {
    source: "Arbetsförmedlingen",
    fetched,
    written,
  };
}
