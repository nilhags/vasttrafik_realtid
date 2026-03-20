import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { defaultFilters, filterAndSortJobs, type FilterState, type SortKey } from "../lib/jobFilters";
import { useJobs } from "../hooks/useJobs";

const chipOptions = ["Alla", "Distans", "Hybrid", "På plats"];
const JOBS_PER_PAGE = 20;

const distanceOptions = [
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
];

const ageOptions = [
  { label: "Alla", value: 0 },
  { label: "Senaste dygnet", value: 1 },
  { label: "Senaste 3 dagarna", value: 3 },
  { label: "Senaste veckan", value: 7 },
  { label: "Senaste 14 dagarna", value: 14 },
  { label: "Senaste 30 dagarna", value: 30 },
];

export function DashboardPage() {
  const { jobs, loading } = useJobs();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(0);

  const sourceOptions = useMemo(
    () => ["Alla", ...new Set(jobs.map((job) => job.source).filter(Boolean))],
    [jobs],
  );
  const filteredJobs = useMemo(() => filterAndSortJobs(jobs, filters), [jobs, filters]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const pagedJobs = filteredJobs.slice(
    currentPage * JOBS_PER_PAGE,
    (currentPage + 1) * JOBS_PER_PAGE,
  );

  function updateFilter<Key extends keyof FilterState>(
    key: Key,
    value: FilterState[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setPage(0);
  }

  if (loading) {
    return (
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Laddar</p>
            <h2>Hämtar jobb&hellip;</h2>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Privat läge</p>
          <h2>Samla svenska jobb på ett ställe</h2>
          <p>
            Filtrera fram sådant som faktiskt passar. Tanken är att sökningen
            ska kännas enkel även utan tung teknikvana.
          </p>
        </div>

        <div className="search-panel">
          <label className="search-field search-field--wide">
            Vad vill du jobba med?
            <input
              type="text"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Exempel: administration, butik, content"
            />
          </label>

          <label className="search-field">
            Ort
            <input
              type="text"
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
              placeholder="Karlskoga, Örebro, Karlstad"
            />
          </label>

          <label className="search-field">
            Arbetsgivare
            <input
              type="text"
              value={filters.employer}
              onChange={(event) => updateFilter("employer", event.target.value)}
              placeholder="Exempel: kommunen, ICA, Volvo"
            />
          </label>

          <label className="search-field">
            Omfattning
            <select
              value={filters.employmentType}
              onChange={(event) =>
                updateFilter("employmentType", event.target.value)
              }
            >
              <option>Alla</option>
              <option>Heltid</option>
              <option>Deltid</option>
            </select>
          </label>

          <label className="search-field">
            Erfarenhet
            <select
              value={filters.seniority}
              onChange={(event) => updateFilter("seniority", event.target.value)}
            >
              <option>Alla</option>
              <option>Ingen erfarenhet</option>
              <option>Junior</option>
            </select>
          </label>

          <label className="search-field">
            Avstånd från Karlskoga
            <select
              value={filters.maxDistanceKm}
              onChange={(event) =>
                updateFilter("maxDistanceKm", Number(event.target.value))
              }
            >
              {distanceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            Upplagt
            <select
              value={filters.maxAgeDays}
              onChange={(event) =>
                updateFilter("maxAgeDays", Number(event.target.value))
              }
            >
              {ageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            Sortera efter
            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter("sort", event.target.value as SortKey)
              }
            >
              <option value="date">Nyast först</option>
              <option value="distance">Närmast först</option>
            </select>
          </label>

          <label className="search-field">
            Källa
            <select
              value={filters.source}
              onChange={(event) => updateFilter("source", event.target.value)}
            >
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chip-row">
          {chipOptions.map((option) => {
            const selected = filters.remote === option;

            return (
              <button
                key={option}
                type="button"
                className={selected ? "filter-chip filter-chip--active" : "filter-chip"}
                onClick={() => updateFilter("remote", option)}
              >
                {option}
              </button>
            );
          })}
          <button
            type="button"
            className={filters.salaryOnly ? "filter-chip filter-chip--active" : "filter-chip"}
            onClick={() => updateFilter("salaryOnly", !filters.salaryOnly)}
          >
            Lön angiven
          </button>
        </div>
      </section>

      <section className="results-header">
        <div>
          <p className="eyebrow">Resultat</p>
          <h3>{filteredJobs.length} jobb matchar</h3>
        </div>
        <p className="status-badge">Skyddad visning</p>
      </section>

      <section className="job-grid">
        {pagedJobs.map((job) => (
          <Link key={job.id} to={`/job/${job.id}`} className="job-card-link">
          <article className="job-card">
            <div className="job-card__top">
              <div>
                <p className="job-source">{job.source}</p>
                <h4>{job.title}</h4>
                <p className="job-meta">
                  {job.employer} • {job.location}
                  {job.distanceKm != null ? ` • ${job.distanceKm} km` : ""}
                  {" • "}{job.remote}
                </p>
              </div>
              <span className="job-date">{job.publishedAt}</span>
            </div>

            <p className="job-excerpt">{job.excerpt}</p>

            <div className="tag-row">
              {job.tags.map((tag) => (
                <span key={tag} className="job-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="job-card__bottom">
              <div>
                <strong>{job.employmentType}</strong>
                <span>{job.seniority}</span>
              </div>
              <div>
                <strong>{job.salary ?? "Lön ej angiven"}</strong>
                <span>Källa: {job.source}</span>
              </div>
            </div>
          </article>
          </Link>
        ))}
      </section>

      {totalPages > 1 && (
        <section className="pagination">
          <button
            className="ghost-button"
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            &larr; Föregående
          </button>
          <span className="pagination-info">
            Sida {currentPage + 1} av {totalPages}
          </span>
          <button
            className="ghost-button"
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            Nästa &rarr;
          </button>
        </section>
      )}
    </main>
  );
}
