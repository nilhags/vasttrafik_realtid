import type { JobItem } from "./mockJobs";

export type SortKey = "date" | "distance";

export type FilterState = {
  query: string;
  location: string;
  employer: string;
  source: string;
  remote: string;
  employmentType: string;
  seniority: string;
  maxDistanceKm: number;
  maxAgeDays: number;
  salaryOnly: boolean;
  sort: SortKey;
};

export const defaultFilters: FilterState = {
  query: "",
  location: "",
  employer: "",
  source: "Alla",
  remote: "Alla",
  employmentType: "Alla",
  seniority: "Alla",
  maxDistanceKm: 100,
  maxAgeDays: 0, // 0 = alla
  salaryOnly: false,
  sort: "date",
};

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function filterAndSortJobs(jobs: JobItem[], filters: FilterState) {
  const query = filters.query.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();
  const employer = filters.employer.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    const searchable = [
      job.title,
      job.employer,
      job.location,
      job.excerpt,
      ...job.tags,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = query.length === 0 || searchable.includes(query);
    const matchesLocation =
      location.length === 0 || job.location.toLowerCase().includes(location);
    const matchesEmployer =
      employer.length === 0 || job.employer.toLowerCase().includes(employer);
    const matchesSource =
      filters.source === "Alla" || job.source === filters.source;
    const matchesRemote =
      filters.remote === "Alla" || job.remote === filters.remote;
    const matchesEmployment =
      filters.employmentType === "Alla" ||
      job.employmentType === filters.employmentType;
    const matchesSeniority =
      filters.seniority === "Alla" || job.seniority === filters.seniority;
    const matchesDistance =
      job.distanceKm == null || job.distanceKm <= filters.maxDistanceKm;
    const matchesAge =
      filters.maxAgeDays === 0 ||
      (job.publishedDate != null && daysSince(job.publishedDate) <= filters.maxAgeDays);
    const matchesSalary = !filters.salaryOnly || Boolean(job.salary);

    return (
      matchesQuery &&
      matchesLocation &&
      matchesEmployer &&
      matchesSource &&
      matchesRemote &&
      matchesEmployment &&
      matchesSeniority &&
      matchesDistance &&
      matchesAge &&
      matchesSalary
    );
  });

  filtered.sort((a, b) => {
    if (filters.sort === "distance") {
      const da = a.distanceKm ?? 999;
      const db = b.distanceKm ?? 999;
      return da - db;
    }
    // date – newest first
    const ta = a.publishedDate?.getTime() ?? 0;
    const tb = b.publishedDate?.getTime() ?? 0;
    return tb - ta;
  });

  return filtered;
}
