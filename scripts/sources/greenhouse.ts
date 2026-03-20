import targets from "../../config/source-targets.json";
import { supabase } from "../lib/supabase";
import type { JobUpsertRow, SourceRunResult } from "../lib/types";

type GreenhouseTarget = {
  boardToken: string;
  employer: string;
};

type GreenhouseJob = {
  id: number;
  title: string;
  location?: { name?: string };
  updated_at?: string;
  absolute_url?: string;
  content?: string;
  metadata?: Array<{ name?: string; value?: string }>;
};

function normalizeRemoteMode(job: GreenhouseJob): string | null {
  const text = [job.title, job.location?.name ?? "", job.content ?? ""]
    .join(" ")
    .toLowerCase();
  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("remote") || text.includes("distans")) return "Distans";
  return "På plats";
}

function mapJob(job: GreenhouseJob, target: GreenhouseTarget): JobUpsertRow {
  return {
    external_id: String(job.id),
    source_name: `Greenhouse:${target.boardToken}`,
    title: job.title,
    employer: target.employer,
    location_name: job.location?.name ?? null,
    region: null,
    latitude: null,
    longitude: null,
    remote_mode: normalizeRemoteMode(job),
    employment_type: null,
    seniority: null,
    language_requirements: null,
    salary_text: null,
    description: job.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? null,
    original_url: job.absolute_url ?? null,
    published_at: job.updated_at ?? null,
    application_deadline: null,
    fetched_at: new Date().toISOString(),
  };
}

async function fetchBoardJobs(target: GreenhouseTarget): Promise<GreenhouseJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${target.boardToken}/jobs?content=true`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Greenhouse ${target.boardToken} ${res.status}`);
  }

  const json = await res.json();
  return (json.jobs ?? []) as GreenhouseJob[];
}

export async function fetchGreenhouseJobs(): Promise<SourceRunResult> {
  const greenhouseTargets = targets.greenhouse as GreenhouseTarget[];
  let fetched = 0;
  let written = 0;

  for (const target of greenhouseTargets) {
    const jobs = await fetchBoardJobs(target);
    const rows = jobs.map((job) => mapJob(job, target));

    if (rows.length === 0) {
      continue;
    }

    const { data, error } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "source_name,external_id" })
      .select("id");

    if (error) {
      console.error(`Greenhouse ${target.boardToken}: ${error.message}`);
      continue;
    }

    fetched += rows.length;
    written += data?.length ?? 0;
    console.log(
      `Greenhouse ${target.boardToken}: ${rows.length} hämtade, ${data?.length ?? 0} skrivna.`,
    );
  }

  return {
    source: "Greenhouse",
    fetched,
    written,
  };
}
