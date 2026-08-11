import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LucideIcon, Briefcase } from "lucide-react";
import { resolveIconByName } from "@/lib/iconRegistry";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "./useSiteContent";
import { useAuth } from "./useAuth";
import { industriesData, IndustryData } from "@/data/industries";

/**
 * Phase 3: Industries are now sourced from the `industries` table (DB-first).
 * The hardcoded `industriesData` array is kept as a *code-side fallback* for
 * resilience when the DB query is loading or fails.
 *
 * Custom industries added via the legacy `site_content` registry are still
 * merged in for backward compatibility — but new entries should be created
 * directly in the `industries` table from the admin panel.
 */
export type DynamicIndustry = IndustryData & {
  isCustom?: boolean;
  /** False = draft (admin-only). True = visible to the public. */
  published: boolean;
  /** Optional Arabic overrides — when present, used instead of i18n strings. */
  nameAr?: string;
  headlineAr?: string;
  descriptionAr?: string;
  painPointsAr?: string[];
  solutionsAr?: string[];
  useCasesAr?: string[];
  beforeAfterAr?: { before: string; after: string };
  ctaAr?: string;
};

interface IndustryRow {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  icon: string;
  headline: string;
  headline_ar: string | null;
  description: string;
  description_ar: string | null;
  pain_points: unknown;
  pain_points_ar: unknown;
  solutions: unknown;
  solutions_ar: unknown;
  use_cases: unknown;
  use_cases_ar: unknown;
  before_text: string;
  before_text_ar: string | null;
  after_text: string;
  after_text_ar: string | null;
  cta: string;
  cta_ar: string | null;
  published: boolean;
  is_hardcoded: boolean;
  sort_order: number;
}

interface RegistryValue {
  name: string;
  icon: string;
  published?: boolean;
}

const parseRegistry = (raw: string | null | undefined): Partial<RegistryValue> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const resolveIcon = (name: string | undefined): LucideIcon => {
  if (!name) return Briefcase;
  return resolveIconByName(name) ?? Briefcase;
};

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const parseOrder = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
};

const sortByOrder = <T extends { slug: string }>(items: T[], order: string[]): T[] => {
  if (order.length === 0) return items;
  const rank = new Map(order.map((slug, i) => [slug, i]));
  return [...items].sort((a, b) => {
    const ra = rank.has(a.slug) ? (rank.get(a.slug) as number) : Number.POSITIVE_INFINITY;
    const rb = rank.has(b.slug) ? (rank.get(b.slug) as number) : Number.POSITIVE_INFINITY;
    return ra - rb;
  });
};

const rowToIndustry = (row: IndustryRow): DynamicIndustry => ({
  slug: row.slug,
  name: row.name,
  icon: resolveIcon(row.icon),
  headline: row.headline,
  description: row.description,
  painPoints: toStringArray(row.pain_points),
  solutions: toStringArray(row.solutions),
  useCases: toStringArray(row.use_cases),
  beforeAfter: { before: row.before_text, after: row.after_text },
  cta: row.cta,
  isCustom: !row.is_hardcoded,
  published: row.published,
  nameAr: row.name_ar ?? undefined,
  headlineAr: row.headline_ar ?? undefined,
  descriptionAr: row.description_ar ?? undefined,
  painPointsAr: toStringArray(row.pain_points_ar),
  solutionsAr: toStringArray(row.solutions_ar),
  useCasesAr: toStringArray(row.use_cases_ar),
  beforeAfterAr:
    row.before_text_ar || row.after_text_ar
      ? { before: row.before_text_ar ?? "", after: row.after_text_ar ?? "" }
      : undefined,
  ctaAr: row.cta_ar ?? undefined,
});

export const useDynamicIndustries = () => {
  const registry = useSiteContent("industries", "registry");
  const orderQuery = useSiteContent("industries", "order");
  const { isAdmin } = useAuth();

  // DB-first: fetch the new industries table
  const industriesQuery = useQuery({
    queryKey: ["industries-table"],
    queryFn: async (): Promise<IndustryRow[]> => {
      const { data, error } = await supabase
        .from("industries")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as IndustryRow[];
    },
    staleTime: 60_000,
  });

  const order = useMemo(() => {
    const row = orderQuery.items.find(
      (i) => i.content_key === "slug_order" && i.content_type === "industry_order",
    );
    return parseOrder(row?.value);
  }, [orderQuery.items]);

  const list = useMemo<DynamicIndustry[]>(() => {
    // Prefer DB rows; fall back to hardcoded array if the query hasn't loaded
    // (or failed). This guarantees the page always renders something.
    const dbRows = industriesQuery.data ?? [];
    let merged: DynamicIndustry[];
    if (dbRows.length > 0) {
      merged = dbRows.map(rowToIndustry);
    } else {
      merged = industriesData.map((i) => ({ ...i, published: true }));
    }

    // Legacy: also surface industries added via site_content registry
    // (kept for backward compatibility — not new behaviour).
    const seenSlugs = new Set(merged.map((i) => i.slug));
    for (const item of registry.items) {
      if (item.content_type !== "industry_card") continue;
      if (seenSlugs.has(item.content_key)) continue;
      const en = parseRegistry(item.value);
      if (!en.name) continue;
      merged.push({
        slug: item.content_key,
        name: en.name,
        icon: resolveIcon(en.icon),
        headline: "",
        description: "",
        painPoints: [],
        solutions: [],
        useCases: [],
        beforeAfter: { before: "", after: "" },
        cta: "",
        isCustom: true,
        published: en.published === true,
      });
    }

    return sortByOrder(merged, order);
  }, [industriesQuery.data, registry.items, order]);

  const publishedList = useMemo<DynamicIndustry[]>(
    () => (isAdmin ? list : list.filter((i) => i.published)),
    [list, isAdmin],
  );

  /** Localized name for an industry. Prefers DB `name_ar`, then legacy registry override. */
  const getName = (slug: string, lang: "en" | "ar"): string | undefined => {
    const fromDb = list.find((i) => i.slug === slug);
    if (fromDb) {
      if (lang === "ar" && fromDb.nameAr) return fromDb.nameAr;
      return fromDb.name;
    }
    // Legacy registry fallback
    const item = registry.items.find((i) => i.content_key === slug);
    if (!item) return undefined;
    if (lang === "ar" && item.value_ar) {
      const ar = parseRegistry(item.value_ar);
      if (ar.name) return ar.name;
    }
    return parseRegistry(item.value).name;
  };

  return {
    ...registry,
    list,
    publishedList,
    getName,
    order,
    /** Raw rows from the industries table (admin/editor consumption). */
    rows: industriesQuery.data ?? [],
    isLoading: industriesQuery.isLoading,
    refetch: industriesQuery.refetch,
  };
};
