import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Detects the "stale chunk after redeploy" failure mode: when a new build ships,
 * the old index.html may reference hashed chunks that no longer exist, so a
 * lazy import() rejects with a chunk/module load error. In that case the right
 * fix is a hard reload to fetch the fresh index.html.
 */
const isChunkLoadError = (error: Error | null): boolean => {
  if (!error) return false;
  const msg = `${error.name} ${error.message}`;
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
};

const RELOAD_GUARD_KEY = "dm-chunk-reload-attempted";

/**
 * Top-level error boundary. Prevents a single render/throw (including a failed
 * lazy route chunk) from white-screening the whole app. Chunk-load errors trigger
 * a one-time automatic hard reload; anything else shows a recovery screen.
 *
 * Deliberately self-contained (no i18n / router hooks) because it sits above the
 * providers and must keep working even if those fail. When an error monitor
 * (e.g. Sentry) is added, report from componentDidCatch.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Auto-recover from a stale-chunk deploy exactly once to avoid a reload loop.
    if (isChunkLoadError(error) && typeof window !== "undefined") {
      try {
        if (!sessionStorage.getItem(RELOAD_GUARD_KEY)) {
          sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* sessionStorage unavailable — fall through to the recovery UI */
      }
    }
    // Hook point for an error monitor (Sentry, etc.).
    console.error("Uncaught application error:", error, info.componentStack);
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  handleHome = () => {
    if (typeof window !== "undefined") window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const chunk = isChunkLoadError(this.state.error);

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div style={{ fontSize: "2.5rem" }} aria-hidden>
          ⚠️
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          {chunk ? "A new version is available" : "Something went wrong"}
        </h1>
        <p style={{ maxWidth: "28rem", margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
          {chunk
            ? "The app was updated. Please reload to get the latest version."
            : "An unexpected error occurred. You can reload the page or return to the homepage."}
        </p>
        <p style={{ maxWidth: "28rem", margin: 0, color: "#cbd5e1", lineHeight: 1.6, direction: "rtl" }} lang="ar">
          {chunk
            ? "تم تحديث التطبيق. يُرجى إعادة التحميل للحصول على أحدث إصدار."
            : "حدث خطأ غير متوقع. يمكنك إعادة تحميل الصفحة أو العودة إلى الصفحة الرئيسية."}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.6rem",
              border: "none",
              background: "#ef5b53",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload / إعادة التحميل
          </button>
          {!chunk && (
            <button
              type="button"
              onClick={this.handleHome}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.6rem",
                border: "1px solid rgba(248,250,252,0.3)",
                background: "transparent",
                color: "#f8fafc",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Home / الرئيسية
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
