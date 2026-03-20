import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { type JobRow } from "../lib/mockJobs";

type JobState = {
  job: JobRow | null;
  loading: boolean;
  error: string | null;
};

export function useJob(id: string | undefined) {
  const [state, setState] = useState<JobState>({
    job: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id || !supabase) {
      setState({ job: null, loading: false, error: "Jobb saknas" });
      return;
    }

    let active = true;

    async function fetchJob() {
      const { data, error } = await supabase!
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (error) {
        setState({ job: null, loading: false, error: error.message });
        return;
      }

      setState({ job: data as JobRow, loading: false, error: null });
    }

    fetchJob();

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
