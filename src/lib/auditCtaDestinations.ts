import {
  isLocalizablePublicPath,
  stripArabicPrefix,
} from "@/lib/localizedRoutes";

/**
 * Pure-logic auditor for CMS-stored CTA / link destinations.
 *
 * It takes a destination value (and the kind it was saved as) and reports
 * whether the value is "clean" or whether it would break the automatic
 * English ↔ Arabic routing handled by `localizeInternalPath`.
 *
 * This is intentionally framework-free so it can be unit-tested and reused
 * by any admin panel, audit script, or edge function.
 */

export type CtaAuditIssue =
  /** Saved as `/ar/...` — should be canonical (`/...`) so the runtime localizer can pick the language. */
  | "ar_prefix"
  /** Internal path missing leading slash (e.g. `contact` instead of `/contact`). */
  | "missing_leading_slash"
  /** Internal path is not in the localizable list — Arabic visitors will land on the English version. */
  | "non_localizable"
  /** kind="link" but the value is actually an absolute URL — should be kind="external". */
  | "external_url_as_link"
  /** kind="link" but value looks like an email/phone — wrong kind. */
  | "email_or_phone_as_link"
  /** Value is empty / whitespace. */
  | "empty";

export interface CtaAuditFinding {
  /** Where the value lives — e.g. "site_content / cta_actions / hero_primary_cta". */
  source: string;
  /** Kind as stored in the CMS (link, external, email, …). */
  kind: string;
  /** Value as stored in the CMS. */
  value: string;
  /** What the auditor would canonicalize the value to. */
  suggested: string;
  /** Detected issues, ordered most → least severe. */
  issues: CtaAuditIssue[];
  severity: "error" | "warning" | "info";
}

const isExternalProtocol = (value: string) =>
  /^(https?:|mailto:|tel:|sms:)/i.test(value);

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value);
const looksLikePhone = (value: string) => /^\+?[\d\s().-]{6,}$/.test(value);

/**
 * Audits a single CMS CTA value. Non-link kinds (email/phone/whatsapp/external)
 * are skipped — they are language-agnostic by definition.
 */
export const auditCtaDestination = (
  source: string,
  kind: string,
  rawValue: string,
): CtaAuditFinding | null => {
  const value = (rawValue ?? "").trim();

  // Anchors and protocol URLs are always fine, regardless of kind.
  if (value.startsWith("#")) return null;

  if (kind !== "link") {
    // For non-link kinds we only flag clearly broken values.
    if (!value && (kind === "email" || kind === "phone" || kind === "whatsapp" || kind === "external")) {
      return {
        source,
        kind,
        value,
        suggested: "",
        issues: ["empty"],
        severity: "warning",
      };
    }
    return null;
  }

  // kind === "link" from here on.
  if (!value) {
    return {
      source,
      kind,
      value,
      suggested: "",
      issues: ["empty"],
      severity: "warning",
    };
  }

  const issues: CtaAuditIssue[] = [];

  if (isExternalProtocol(value)) {
    issues.push("external_url_as_link");
    return {
      source,
      kind,
      value,
      suggested: value,
      issues,
      severity: "warning",
    };
  }

  if (looksLikeEmail(value) || (looksLikePhone(value) && !value.startsWith("/"))) {
    issues.push("email_or_phone_as_link");
    return {
      source,
      kind,
      value,
      suggested: value,
      issues,
      severity: "warning",
    };
  }

  let canonical = value;
  if (!canonical.startsWith("/")) {
    issues.push("missing_leading_slash");
    canonical = `/${canonical}`;
  }

  if (canonical === "/ar" || canonical.startsWith("/ar/")) {
    issues.push("ar_prefix");
    canonical = stripArabicPrefix(canonical);
  }

  // Only check localizability against the path portion (drop ?query / #hash).
  const pathOnly = canonical.split(/[?#]/)[0] || "/";
  if (!isLocalizablePublicPath(pathOnly)) {
    issues.push("non_localizable");
  }

  if (issues.length === 0) return null;

  const severity: CtaAuditFinding["severity"] = issues.includes("ar_prefix")
    ? "error"
    : issues.includes("non_localizable")
      ? "info"
      : "warning";

  return {
    source,
    kind,
    value,
    suggested: canonical,
    issues,
    severity,
  };
};

export const ISSUE_LABELS: Record<CtaAuditIssue, string> = {
  ar_prefix: "Saved with /ar prefix — Arabic visitors get a stale link, English visitors get a 404.",
  missing_leading_slash: "Missing leading slash — internal paths must start with /.",
  non_localizable: "Path has no /ar counterpart — Arabic visitors will fall back to the English page.",
  external_url_as_link: "Stored as an internal link but value is an absolute URL — change kind to External.",
  email_or_phone_as_link: "Stored as an internal link but value looks like an email/phone — change kind accordingly.",
  empty: "Destination is empty.",
};
