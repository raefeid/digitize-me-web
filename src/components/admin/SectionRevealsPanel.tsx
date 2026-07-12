import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ExternalLink, Wand2, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSaveContent } from "@/hooks/useSiteContent";
import {
  REVEAL_OPTIONS,
  RevealType,
  RevealConfig,
  DEFAULT_REVEAL,
  DEFAULT_DURATION,
  DEFAULT_STAGGER,
} from "@/hooks/useSectionReveals";

const PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Home", path: "/" },
  { key: "product", label: "Product", path: "/product" },
  { key: "pricing", label: "Pricing", path: "/pricing" },
  { key: "industries", label: "Industries", path: "/industries" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "blog", label: "Blog", path: "/blog" },
];

interface RevealRow {
  id: string;
  content_key: string;
  value: string;
}

const SectionRevealsPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const saveContent = useSaveContent();
  const [activePage, setActivePage] = useState<string>("home");
  // Section key currently being confirmed for delete (null = dialog closed).
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Whole-page reset confirmation state.
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { data: rows, refetch } = useQuery({
    queryKey: ["reveals", activePage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("id, content_key, value")
        .eq("page", activePage)
        .eq("section", "reveals");
      if (error) throw error;
      return (data || []) as RevealRow[];
    },
  });

  // Pull all distinct section keys we've ever stored for this page so admins
  // can adjust them without first visiting the page.
  const sectionKeys = Array.from(
    new Set((rows || []).map((r) => r.content_key.split("__")[0]))
  ).sort();

  const getConfig = (key: string): RevealConfig => {
    const animRow = rows?.find((r) => r.content_key === `${key}__anim`);
    const durRow = rows?.find((r) => r.content_key === `${key}__duration`);
    const stagRow = rows?.find((r) => r.content_key === `${key}__stagger`);
    const hideRow = rows?.find((r) => r.content_key === `${key}__hidden`);
    return {
      anim: ((animRow?.value as RevealType) || DEFAULT_REVEAL) as RevealType,
      duration: Number(durRow?.value) || DEFAULT_DURATION,
      stagger: Number(stagRow?.value) || DEFAULT_STAGGER,
      hidden: hideRow?.value === "1",
    };
  };

  const setConfig = async (sectionKey: string, partial: Partial<RevealConfig>) => {
    const current = getConfig(sectionKey);
    const next = { ...current, ...partial };
    const animRow = rows?.find((r) => r.content_key === `${sectionKey}__anim`);
    const durRow = rows?.find((r) => r.content_key === `${sectionKey}__duration`);
    const stagRow = rows?.find((r) => r.content_key === `${sectionKey}__stagger`);
    const hideRow = rows?.find((r) => r.content_key === `${sectionKey}__hidden`);

    try {
      await Promise.all([
        saveContent.mutateAsync({
          id: animRow?.id,
          page: activePage,
          section: "reveals",
          content_key: `${sectionKey}__anim`,
          value: next.anim,
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: durRow?.id,
          page: activePage,
          section: "reveals",
          content_key: `${sectionKey}__duration`,
          value: String(next.duration),
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: stagRow?.id,
          page: activePage,
          section: "reveals",
          content_key: `${sectionKey}__stagger`,
          value: String(next.stagger),
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: hideRow?.id,
          page: activePage,
          section: "reveals",
          content_key: `${sectionKey}__hidden`,
          value: next.hidden ? "1" : "0",
          content_type: "text",
          sort_order: 0,
        }),
      ]);
      await refetch();
      toast({ title: "Animation updated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  /**
   * Delete every reveal-config row for a section key (anim/duration/stagger/hidden).
   * NOTE: this only removes the *animation settings* row; it does NOT touch the
   * actual page content (text, images, blocks) — those live under different
   * `section` values in `site_content`. The section will simply revert to the
   * default fade-up animation next time it renders.
   */
  const deleteSection = async (sectionKey: string) => {
    const ids = (rows || [])
      .filter((r) => r.content_key.startsWith(`${sectionKey}__`))
      .map((r) => r.id);
    if (ids.length === 0) {
      setPendingDeleteKey(null);
      return;
    }
    setDeleting(true);
    try {
      const { error } = await supabase.from("site_content").delete().in("id", ids);
      if (error) throw error;
      await refetch();
      toast({
        title: "Section animation removed",
        description: `Reverted ${sectionKey} to the default reveal.`,
      });
      setPendingDeleteKey(null);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Wipe every reveal-config row for the entire active page in one shot.
   * Same safety semantics as `deleteSection`: only the animation rows under
   * `section = "reveals"` are removed — page content is untouched and every
   * section reverts to the default fade-up reveal.
   */
  const resetPage = async () => {
    const ids = (rows || []).map((r) => r.id);
    if (ids.length === 0) {
      setResetOpen(false);
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.from("site_content").delete().in("id", ids);
      if (error) throw error;
      await refetch();
      toast({
        title: "Page animations reset",
        description: `Cleared ${sectionKeys.length} section${sectionKeys.length === 1 ? "" : "s"} on ${PAGES.find((p) => p.key === activePage)?.label}.`,
      });
      setResetOpen(false);
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  const activePagePath = PAGES.find((p) => p.key === activePage)?.path || "/";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wand2 size={20} className="text-accent" />
          <h2 className="text-xl font-bold text-foreground">Section reveal animations</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how each section animates when it scrolls into view. Pick a page below, then adjust per-section.
          For best results, open the page in Edit Mode to see live previews and labels.
        </p>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activePage === p.key
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
            disabled={sectionKeys.length === 0}
            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            title="Remove all saved animations on this page"
          >
            <RotateCcw size={14} />
            Reset all sections
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`${activePagePath}?edit=1`)}
            className="gap-1"
          >
            <ExternalLink size={14} />
            Open {PAGES.find((p) => p.key === activePage)?.label} in Edit Mode
          </Button>
        </div>
      </div>

      {/* Section list */}
      {sectionKeys.length === 0 ? (
        <div className="bg-muted/30 border border-dashed border-border rounded-lg p-8 text-center">
          <Sparkles size={28} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            No animation choices saved for this page yet.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Open the page in Edit Mode and click any section's chip to assign an animation.
            All sections currently use the default <span className="font-mono">fade-up</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sectionKeys.map((key) => {
            const cfg = getConfig(key);
            const label = key.replace(/^section_/, "Section ");
            return (
              <div key={key} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground font-mono hidden sm:block">
                      {cfg.anim} · {cfg.duration}ms · stagger {cfg.stagger}ms
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteKey(key)}
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete this section's animation settings"
                    >
                      <Trash2 size={14} />
                      <span className="ml-1 text-xs">Delete</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                    Animation
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {REVEAL_OPTIONS.map((opt) => {
                      const active = cfg.anim === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setConfig(key, { anim: opt.value })}
                          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                            active
                              ? "bg-accent/15 text-accent font-medium"
                              : "bg-muted text-foreground hover:bg-muted/70"
                          }`}
                          title={opt.hint}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Duration
                      </div>
                      <div className="text-xs font-mono text-foreground">{cfg.duration}ms</div>
                    </div>
                    <Slider
                      value={[cfg.duration]}
                      min={200}
                      max={1500}
                      step={50}
                      disabled={cfg.anim === "none"}
                      onValueCommit={(v) => setConfig(key, { duration: v[0] })}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Stagger
                      </div>
                      <div className="text-xs font-mono text-foreground">{cfg.stagger}ms</div>
                    </div>
                    <Slider
                      value={[cfg.stagger]}
                      min={0}
                      max={300}
                      step={10}
                      disabled={cfg.anim === "none"}
                      onValueCommit={(v) => setConfig(key, { stagger: v[0] })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/*
        Confirmation dialog — protects admins from accidentally wiping a
        section's saved animation. We delete *only* the four reveal-config
        rows for the chosen key; the page's content remains untouched.
      */}
      <AlertDialog
        open={pendingDeleteKey !== null}
        onOpenChange={(open) => { if (!open && !deleting) setPendingDeleteKey(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this section's animation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved reveal animation for{" "}
              <span className="font-mono text-foreground">{pendingDeleteKey}</span> on the{" "}
              <span className="font-semibold text-foreground">
                {PAGES.find((p) => p.key === activePage)?.label}
              </span>{" "}
              page. The section itself and its content stay untouched — it will just
              fall back to the default <span className="font-mono">fade-up</span> reveal.
              <br />
              <br />
              This cannot be undone. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                // Prevent default close — we close manually after the async delete resolves.
                e.preventDefault();
                if (pendingDeleteKey) deleteSection(pendingDeleteKey);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/*
        Whole-page reset dialog — same destructive pattern as single-section
        delete, just bigger blast radius. We list the count so the admin can
        sanity-check before nuking.
      */}
      <AlertDialog
        open={resetOpen}
        onOpenChange={(open) => { if (!open && !resetting) setResetOpen(false); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all section animations on this page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the saved reveal animations for{" "}
              <span className="font-semibold text-foreground">{sectionKeys.length}</span>{" "}
              section{sectionKeys.length === 1 ? "" : "s"} on the{" "}
              <span className="font-semibold text-foreground">
                {PAGES.find((p) => p.key === activePage)?.label}
              </span>{" "}
              page. Page content, layout, and blocks are not touched — every section
              just falls back to the default <span className="font-mono">fade-up</span> reveal.
              <br />
              <br />
              This cannot be undone. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={resetting}
              onClick={(e) => {
                e.preventDefault();
                resetPage();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetting ? "Resetting…" : "Yes, reset all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SectionRevealsPanel;
