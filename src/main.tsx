import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { initMonitoring } from "./lib/monitoring.ts";
import "./index.css";

// Initialize error monitoring early (no-op unless VITE_SENTRY_DSN is set).
initMonitoring();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
