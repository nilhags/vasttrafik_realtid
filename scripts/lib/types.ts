export type JobUpsertRow = {
  external_id: string;
  source_name: string;
  title: string;
  employer: string;
  location_name: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  remote_mode: string | null;
  employment_type: string | null;
  seniority: string | null;
  language_requirements?: string | null;
  salary_text: string | null;
  description: string | null;
  original_url: string | null;
  published_at: string | null;
  application_deadline: string | null;
  fetched_at: string;
};

export type SourceRunResult = {
  source: string;
  fetched: number;
  written: number;
};
