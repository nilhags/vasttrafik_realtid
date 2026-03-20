import { useParams, Link } from "react-router-dom";
import { useJob } from "../hooks/useJob";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { job, loading, error } = useJob(id);

  if (loading) {
    return (
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Laddar</p>
            <h2>Hämtar jobbdetaljer&hellip;</h2>
          </div>
        </section>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Fel</p>
            <h2>Kunde inte hitta jobbet</h2>
            <Link to="/" className="ghost-button">
              Tillbaka till sökningen
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <section className="job-detail-back">
        <Link to="/" className="ghost-button">
          &larr; Tillbaka
        </Link>
      </section>

      <section className="job-detail-card">
        <div className="job-detail-header">
          <div>
            <p className="eyebrow">{job.source_name ?? "Okänd källa"}</p>
            <h2>{job.title}</h2>
            <p className="job-meta">
              {job.employer}
              {job.location_name ? ` • ${job.location_name}` : ""}
              {job.remote_mode ? ` • ${job.remote_mode}` : ""}
            </p>
          </div>
        </div>

        <div className="job-detail-info">
          {job.employment_type && (
            <div className="job-detail-field">
              <span className="job-detail-label">Anställningsform</span>
              <span>{job.employment_type}</span>
            </div>
          )}
          {job.seniority && (
            <div className="job-detail-field">
              <span className="job-detail-label">Erfarenhet</span>
              <span>{job.seniority}</span>
            </div>
          )}
          {job.salary_text && (
            <div className="job-detail-field">
              <span className="job-detail-label">Lön</span>
              <span>{job.salary_text}</span>
            </div>
          )}
          {job.region && (
            <div className="job-detail-field">
              <span className="job-detail-label">Region</span>
              <span>{job.region}</span>
            </div>
          )}
          {job.application_deadline && (
            <div className="job-detail-field">
              <span className="job-detail-label">Sista ansökningsdag</span>
              <span>
                {new Date(job.application_deadline).toLocaleDateString("sv-SE")}
              </span>
            </div>
          )}
          {job.published_at && (
            <div className="job-detail-field">
              <span className="job-detail-label">Publicerad</span>
              <span>
                {new Date(job.published_at).toLocaleDateString("sv-SE")}
              </span>
            </div>
          )}
        </div>

        {job.description && (
          <div className="job-detail-description">
            <h3>Beskrivning</h3>
            <p>{job.description}</p>
          </div>
        )}

        {job.original_url && (
          <div className="job-detail-actions">
            <a
              href={job.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              Visa originalet &rarr;
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
