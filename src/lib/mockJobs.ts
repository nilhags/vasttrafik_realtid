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

// Karlskoga centrum
const KARLSKOGA_LAT = 59.3267;
const KARLSKOGA_LON = 14.5208;

/** Haversine distance in km. */
export function distanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const dist =
    row.latitude != null && row.longitude != null
      ? distanceKm(KARLSKOGA_LAT, KARLSKOGA_LON, row.latitude, row.longitude)
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
