import { Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AppShell() {
  async function handleSignOut() {
    await supabase?.auth.signOut();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Jobbkompassen</p>
          <h1>Hitta rätt jobb snabbare</h1>
        </div>
        <button className="ghost-button" type="button" onClick={handleSignOut}>
          Logga ut
        </button>
      </header>
      <Outlet />
    </div>
  );
}
