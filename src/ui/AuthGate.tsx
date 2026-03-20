import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasSupabaseEnv } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const location = useLocation();
  const { session, loading } = useAuth();

  if (!hasSupabaseEnv) {
    return (
      <main className="setup-screen">
        <section className="setup-card">
          <p className="eyebrow">Setup krävs</p>
          <h1>Supabase-miljövariabler saknas</h1>
          <p>
            Lägg in <code>VITE_SUPABASE_URL</code> och{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> innan appen kan användas bakom
            inloggning.
          </p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="setup-screen">
        <section className="setup-card">
          <p className="eyebrow">Startar</p>
          <h1>Kontrollerar inloggning</h1>
        </section>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
