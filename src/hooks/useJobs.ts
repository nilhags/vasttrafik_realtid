import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { type JobItem, type JobRow, mockJobs, rowToJobItem } from "../lib/mockJobs";

const PAGE_SIZE = 1000;
const SELECT_FIELDS =
  "id, title, employer, location_name, region, remote_mode, employment_type, seniority, language_requirements, salary_text, description, source_name, original_url, published_at, application_deadline, latitude, longitude";

type JobsState = {
  jobs: JobItem[];
  loading: boolean;
  error: string | null;
};

export function useJobs() {
  const [state, setState] = useState<JobsState>({
    jobs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!supabase) {
      setState({ jobs: mockJobs, loading: false, error: null });
      return;
    }

    let active = true;

    async function fetchAllJobs() {
      const allRows: JobRow[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase!
          .from("jobs")
          .select(SELECT_FIELDS)
          .order("published_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (!active) return;

        if (error) {
          setState({ jobs: mockJobs, loading: false, error: error.message });
          return;
        }

        allRows.push(...(data as JobRow[]));

        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      const items = allRows.length > 0 ? allRows.map(rowToJobItem) : mockJobs;
      setState({ jobs: items, loading: false, error: null });
    }

    fetchAllJobs();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
