import targets from "../../config/source-targets.json";
import { supabase } from "../lib/supabase";
import type { JobUpsertRow, SourceRunResult } from "../lib/types";

type LeverTarget = {
  site: string;
  employer: string;
  region?: string;
};

type LeverJob = {
  id: string;
  text: string;
  hostedUrl?: string;
  descriptionPlain?: string;
  categories?: {
    location?: string;
    commitment?: string;
    team?: string;
  };
  workplaceType?: "unspecified" | "on-site" | "remote" | "hybrid";
  salaryDescriptionPlain?: string;
  createdAt?: number;
};

function normalizeRemoteMode(workplaceType: LeverJob["workplaceType"]): string | null {
  if (workplaceType === "remote") return "Distans";
  if (workplaceType === "hybrid") return "Hybrid";
  if (workplaceType === "on-site") return "På plats";
  return null;
}

function mapJob(job: LeverJob, target: LeverTarget): JobUpsertRow {
  return {
    external_id: job.id,
    source_name: `Lever:${target.site}`,
    title: job.text,
    employer: target.employer,
    location_name: job.categories?.location ?? null,
    region: target.region ?? null,
    latitude: null,
    longitude: null,
    remote_mode: normalizeRemoteMode(job.workplaceType),
    employment_type: job.categories?.commitment ?? null,
    seniority: null,
    language_requirements: null,
    salary_text: job.salaryDescriptionPlain ?? null,
    description: job.descriptionPlain ?? null,
    original_url: job.hostedUrl ?? null,
    published_at: job.createdAt ? new Date(job.createdAt).toISOString() : null,
    application_deadline: null,
    fetched_at: new Date().toISOString(),
  };
}

async function fetchLeverSiteJobs(target: LeverTarget): Promise<LeverJob[]> {
  const url = `https://api.lever.co/v0/postings/${target.site}?mode=json&limit=100`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Lever ${target.site} ${res.status}`);
  }

  return (await res.json()) as LeverJob[];
}

export async function fetchLeverJobs(): Promise<SourceRunResult> {
  const leverTargets = targets.lever as LeverTarget[];
  let fetched = 0;
  let written = 0;

  for (const target of leverTargets) {
    const jobs = await fetchLeverSiteJobs(target);
    const rows = jobs.map((job) => mapJob(job, target));

    if (rows.length === 0) {
      continue;
    }

    const { data, error } = await supabase
      .from("jobs")
      .upsert(rows, { onConflict: "source_name,external_id" })
      .select("id");

    if (error) {
      console.error(`Lever ${target.site}: ${error.message}`);
      continue;
    }

    fetched += rows.length;
    written += data?.length ?? 0;
    console.log(`Lever ${target.site}: ${rows.length} hämtade, ${data?.length ?? 0} skrivna.`);
  }

  return {
    source: "Lever",
    fetched,
    written,
  };
}
