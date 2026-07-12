import type { Language } from "@/i18n/LanguageContext";

const AR_PREFIX = "/ar";
// Routes that have a localized `/ar` counterpart in the router. Keep this in sync
// with the `/ar/*` <Route> entries in `src/App.tsx` so language detection works
// for every public localized page (auth pages included).
const LOCALIZABLE_BASE_PATHS = [
  "/",
  "/product",
  "/industries",
  "/pricing",
  "/contact",
  "/about",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const splitPathParts = (value: string) => {
  const [pathAndSearch, hash = ""] = value.split("#");
  const [pathname = "/", search = ""] = pathAndSearch.split("?");
  return {
    pathname: pathname || "/",
    search: search ? `?${search}` : "",
    hash: hash ? `#${hash}` : "",
  };
};

const isExternalPath = (value: string) => /^(https?:|mailto:|tel:|sms:|#)/i.test(value);

export const stripArabicPrefix = (pathname: string) => {
  if (pathname === AR_PREFIX) return "/";
  if (pathname.startsWith(`${AR_PREFIX}/`)) return pathname.slice(AR_PREFIX.length);
  return pathname || "/";
};

export const isLocalizablePublicPath = (pathname: string) => {
  const normalized = stripArabicPrefix(pathname);
  return LOCALIZABLE_BASE_PATHS.some((basePath) =>
    basePath === "/"
      ? normalized === "/"
      : normalized === basePath || normalized.startsWith(`${basePath}/`),
  );
};

export const getLanguageFromPath = (pathname: string): Language =>
  pathname === AR_PREFIX || pathname.startsWith(`${AR_PREFIX}/`) ? "ar" : "en";

export const localizeInternalPath = (to: string, lang: Language) => {
  if (!to || isExternalPath(to)) return to;

  const { pathname, search, hash } = splitPathParts(to);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!isLocalizablePublicPath(normalizedPath)) {
    return `${normalizedPath}${search}${hash}`;
  }

  const basePath = stripArabicPrefix(normalizedPath);
  const localizedPath = lang === "ar"
    ? `${AR_PREFIX}${basePath === "/" ? "" : basePath}`
    : basePath;

  return `${localizedPath}${search}${hash}`;
};

export const switchLanguagePath = (to: string, lang: Language) => localizeInternalPath(to, lang);