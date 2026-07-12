/**
 * Console messages we tolerate. Errors are NEVER allowlisted — only warnings.
 *
 * Patterns are matched against the full message text (case-insensitive substring
 * or regex). Add narrow, justified entries; do not blanket-suppress real noise.
 */
export const WARNING_ALLOWLIST: Array<RegExp | string> = [
  // React DevTools nag in dev mode.
  /Download the React DevTools/i,

  // React Router future-flag warnings (v6 -> v7) are informational.
  /React Router Future Flag Warning/i,

  // Vite HMR connection chatter.
  /\[vite\] connect/i,
  /\[vite\] hot updated/i,

  // React StrictMode double-invoke notices in dev.
  /Encountered two children with the same key/i, // surfaced separately as error if real

  // Helmet async dev warnings about duplicate tags during route transitions.
  /Helmet:.*duplicate/i,
];

export function isAllowlistedWarning(text: string): boolean {
  return WARNING_ALLOWLIST.some((p) =>
    typeof p === "string" ? text.includes(p) : p.test(text),
  );
}

/**
 * URLs whose failed responses we ignore. Keep this list tiny and justified.
 */
export const NETWORK_IGNORE: RegExp[] = [
  // Browsers probe for /favicon.ico aggressively; missing favicon is not a regression.
  /\/favicon\.ico(\?|$)/i,
  // Vite HMR ping.
  /\/@vite\/client/i,
  // Source maps occasionally 404 in dev.
  /\.map(\?|$)/i,
];

export function isIgnoredRequestUrl(url: string): boolean {
  return NETWORK_IGNORE.some((p) => p.test(url));
}
