import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const location = useLocation();
  const { session, loading } = useAuth();
  const locationState = location.state as { from?: string } | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!hasSupabaseEnv) {
    return (
      <main className="auth-layout">
        <section className="auth-panel">
          <p className="eyebrow">Privat app</p>
          <h1>Inloggning aktiveras när Supabase är kopplat</h1>
          <p>
            Appen är förberedd för e-post och lösenord, men behöver först
            miljövariablerna från ert Supabase-projekt.
          </p>
        </section>
      </main>
    );
  }

  if (!loading && session) {
    const redirectTo =
      typeof locationState?.from === "string" ? locationState.from : "/";

    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Fel e-post eller lösenord.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel auth-panel--brand">
        <p className="eyebrow">Jobbkompassen</p>
        <h1>Privat jobbsökning utan brus</h1>
        <p>
          Samlar jobb från flera svenska källor, visar bara relevanta annonser
          och kräver inloggning innan något visas.
        </p>
        <div className="brand-points">
          <span>Skyddad med lösenord</span>
          <span>Inte indexerbar</span>
          <span>Byggd för enkel användning</span>
        </div>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <p className="eyebrow">Logga in</p>
          <h2>Fortsätt till din sökning</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              E-post
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="namn@exempel.se"
                required
              />
            </label>

            <label>
              Lösenord
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ditt lösenord"
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Loggar in..." : "Logga in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
