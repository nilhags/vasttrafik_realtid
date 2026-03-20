/** Shape returned by the jobs table in Supabase. */
export type JobRow = {
  id: string;
  title: string;
  employer: string;
  location_name: string | null;
  region: string | null;
  remote_mode: string | null;
  employment_type: string | null;
  seniority: string | null;
  language_requirements: string | null;
  salary_text: string | null;
  description: string | null;
  source_name: string | null;
  original_url: string | null;
  published_at: string | null;
  application_deadline: string | null;
  latitude: number | null;
  longitude: number | null;
};

import { distanceKm, inferCoordinatesFromLocation, KARLSKOGA } from "../../shared/locationCatalog";

/** Lightweight view-model used by UI components. */
export type JobItem = {
  id: string;
  title: string;
  employer: string;
  location: string;
  remote: string;
  employmentType: string;
  seniority: string;
  salary?: string;
  publishedAt: string;
  publishedDate: Date | null;
  distanceKm: number | null;
  source: string;
  excerpt: string;
  tags: string[];
};

/** Map a Supabase row to the UI view-model. */
export function rowToJobItem(row: JobRow): JobItem {
  const pubDate = row.published_at ? new Date(row.published_at) : null;
  const inferredCoordinates = inferCoordinatesFromLocation(row.location_name);
  const latitude = row.latitude ?? inferredCoordinates?.lat ?? null;
  const longitude = row.longitude ?? inferredCoordinates?.lon ?? null;
  const dist =
    latitude != null && longitude != null
      ? distanceKm(KARLSKOGA.lat, KARLSKOGA.lon, latitude, longitude)
      : null;

  return {
    id: row.id,
    title: row.title,
    employer: row.employer,
    location: row.location_name ?? "Okänd ort",
    remote: row.remote_mode ?? "På plats",
    employmentType: row.employment_type ?? "Heltid",
    seniority: row.seniority ?? "",
    salary: row.salary_text ?? undefined,
    publishedAt: pubDate ? pubDate.toLocaleDateString("sv-SE") : "",
    publishedDate: pubDate,
    distanceKm: dist != null ? Math.round(dist) : null,
    source: row.source_name ?? "",
    excerpt: row.description?.slice(0, 160) ?? "",
    tags: [row.employment_type, row.language_requirements, row.region]
      .filter(Boolean) as string[],
  };
}

export const mockJobs: JobItem[] = [
  {
    id: "1",
    title: "Administratör till kundservice",
    employer: "Göteborgs Stad",
    location: "Göteborg",
    remote: "Hybrid",
    employmentType: "Heltid",
    seniority: "Junior",
    salary: "31 000 - 34 000 kr",
    publishedAt: "Idag",
    publishedDate: new Date(),
    distanceKm: null,
    source: "Arbetsförmedlingen",
    excerpt:
      "Stöd kunder via telefon och mejl, koordinera ärenden och arbeta i ett lugnt team med tydliga rutiner.",
    tags: ["Kundservice", "Administration", "Svenska"],
  },
];
