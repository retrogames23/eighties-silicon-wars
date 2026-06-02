import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";

// Rewrite raw Supabase auth hashes (e.g. #access_token=...&type=recovery)
// into HashRouter-compatible hashes so our /reset-password route can handle them.
// This runs AFTER imports so the Supabase client has already parsed and stored
// the session token during its own initialization.
const rawHash = window.location.hash;
if (rawHash && rawHash.length > 1 && !rawHash.startsWith('#/')) {
  const params = new URLSearchParams(rawHash.slice(1));
  if (params.get('type') === 'recovery' && params.get('access_token')) {
    window.location.hash = '#/reset-password?' + params.toString();
  }
}

createRoot(document.getElementById("root")!).render(<App />);
