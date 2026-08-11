/**
 * Error monitoring (Sentry) — opt-in and lazily loaded.
 *
 * Sentry is only initialized when VITE_SENTRY_DSN is set, and the SDK is loaded
 * via dynamic import() so it stays out of the main bundle when monitoring is off.
 *
 * Scope: error/exception capture only. No Session Replay and no PII
 * (sendDefaultPii: false) so this counts as functional error monitoring rather
 * than analytics — it needs no cookie consent and sets no cookies. Do not add
 * Replay or PII here without wiring it into the cookie-consent flow.
 */

type CaptureFn = (error: unknown, context?: Record<string, unknown>) => void;

let capture: CaptureFn | null = null;

export async function initMonitoring(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || capture) return;

  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // Keep volume low and predictable; raise if you add tracing intentionally.
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
    capture = (error, context) =>
      Sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    /* monitoring is best-effort; never let it break the app */
  }
}

/**
 * Report a handled error to the monitor. No-ops when monitoring is not
 * configured/initialized.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  capture?.(error, context);
}
