import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * One tool row in the All-in-One comparison section.
 *
 * Stored as a JSON array under a single `site_content` row:
 *   page = "home", section = "aio_tools", content_key = "aio_tools_list",
 *   content_type = "json", value = JSON.stringify(AioTool[])
 *
 * The list is fully admin-editable from the Home page editor.
 */
export interface AioTool {
  /** Stable client id — used as React key and to address inline EditableText slots. */
  id: string;
  /** Lucide icon name, e.g. "ScanLine". Resolved at render time. */
  icon: string;
  /** English display name. */
  name: string;
  /** Arabic display name (optional). */
  name_ar?: string;
  /** Competitor / replaced product label, e.g. "ABBYY". */
  competitor: string;
  /** Standalone tool price in USD. Used for the strikethrough total. */
  price: number;
}

const STORAGE_PAGE = "home";
const STORAGE_SECTION = "aio_tools";
const STORAGE_KEY = "aio_tools_list";

/** Hardcoded fallback list — also seeds the editor on first save. */
export const DEFAULT_AIO_TOOLS: AioTool[] = [
  { id: "tool1", icon: "ScanLine", name: "Scanning", competitor: "ABBYY", price: 49 },
  { id: "tool2", icon: "Languages", name: "OCR", competitor: "Tesseract Pro", price: 35 },
  { id: "tool3", icon: "Brain", name: "AI Extraction", competitor: "Rossum", price: 89 },
  { id: "tool4", icon: "Search", name: "Search", competitor: "Elasticsearch", price: 95 },
  { id: "tool5", icon: "FolderSearch", name: "Find Documents", competitor: "DocuWare", price: 60 },
  { id: "tool6", icon: "Share2", name: "Share", competitor: "SharePoint", price: 45 },
  { id: "tool7", icon: "Users", name: "Collaborate", competitor: "Google Drive", price: 30 },
  { id: "tool8", icon: "ShieldCheck", name: "ID Verification", competitor: "Hyperverge", price: 55 },
  { id: "tool9", icon: "Archive", name: "Archive", competitor: "Iron Mountain", price: 40 },
  { id: "tool10", icon: "FileText", name: "Classify", competitor: "Kofax", price: 70 },
  { id: "tool11", icon: "Workflow", name: "Workflow", competitor: "Zapier", price: 49 },
  { id: "tool12", icon: "FileCheck", name: "Approvals", competitor: "DocuSign", price: 45 },
];

/**
 * Generate a fresh stable id for a newly-added tool.
 * Format: `t_{timestamp}_{rand}` so it never collides with existing ids.
 */
export const newAioToolId = () =>
  `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

/**
 * Read the saved list from `site_content`. Returns the defaults when no row exists
 * or the stored value can't be parsed (defensive — the editor always writes valid JSON).
 */
const fetchAioTools = async (): Promise<AioTool[]> => {
  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("page", STORAGE_PAGE)
    .eq("section", STORAGE_SECTION)
    .eq("content_key", STORAGE_KEY)
    .maybeSingle();

  if (error) throw error;
  if (!data?.value) return DEFAULT_AIO_TOOLS;

  try {
    const parsed = JSON.parse(data.value);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_AIO_TOOLS;
    // Light shape validation — drop anything that doesn't have the required fields.
    return parsed.filter(
      (t): t is AioTool =>
        t &&
        typeof t.id === "string" &&
        typeof t.icon === "string" &&
        typeof t.name === "string" &&
        typeof t.competitor === "string" &&
        typeof t.price === "number"
    );
  } catch {
    return DEFAULT_AIO_TOOLS;
  }
};

/** Public hook used by the section + the admin editor. */
export const useAioTools = () => {
  return useQuery({
    queryKey: ["aio-tools-list"],
    queryFn: fetchAioTools,
    staleTime: 30_000,
  });
};

/** Persist the entire list (single upsert). */
export const useSaveAioTools = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tools: AioTool[]) => {
      const value = JSON.stringify(tools);

      // Look up the row id (so we can update in place rather than insert a duplicate).
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("page", STORAGE_PAGE)
        .eq("section", STORAGE_SECTION)
        .eq("content_key", STORAGE_KEY)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from("site_content")
          .update({ value, content_type: "json" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({
          page: STORAGE_PAGE,
          section: STORAGE_SECTION,
          content_key: STORAGE_KEY,
          value,
          content_type: "json",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aio-tools-list"] });
      // The section also reads per-slot text overrides from the same section —
      // refresh those queries too so rename takes effect immediately.
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
  });
};
