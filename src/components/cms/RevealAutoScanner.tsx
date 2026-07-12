import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Wand2, Eye, EyeOff, Bookmark, X, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEditMode } from "./EditModeContext";
import {
  REVEAL_OPTIONS,
  RevealType,
  RevealConfig,
  animationName,
  useSectionReveals,
  useRevealRegistry,
} from "@/hooks/useSectionReveals";

interface RevealAutoScannerProps {
  /** Page identifier — must match the page used elsewhere in CMS (e.g. "home") */
  page: string;
}

interface DetectedSectionRef {
  key: string;
  label: string;
  element: HTMLElement;
}

/**
 * Drop one of these at the top of any page. On mount it walks the page DOM
 * looking for top-level <section> elements (and direct <div> children of
 * <main> as a fallback for pages that don't use semantic <section>), assigns
 * each a stable position-based data-attribute, applies the configured reveal
 * animation, and registers them for the floating chips + admin panel.
 *
 * The scanner is invisible at runtime; in Edit Mode it overlays a tiny
 * floating chip on each detected section.
 */
const RevealAutoScanner = ({ page }: RevealAutoScannerProps) => {
  const { enabled } = useEditMode();
  const { getConfig, items } = useSectionReveals(page);
  const { register } = useRevealRegistry();
  const [detected, setDetected] = useState<DetectedSectionRef[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Re-scan after mount + whenever the route changes. The scanner runs after
  // a microtask delay so child sections have rendered.
  useEffect(() => {
    let cancelled = false;
    const scan = () => {
      if (cancelled) return;
      const main = document.querySelector("main") || document.body;
      // Prefer real <section> tags; fall back to <div> direct children of <main>
      let candidates = Array.from(main.querySelectorAll(":scope > section"));
      if (candidates.length === 0) {
        candidates = Array.from(main.querySelectorAll(":scope > div, :scope > section"));
      }
      // Also catch sections rendered through wrapper components — they're typically
      // <section> nested one level under <main>.
      const nested = Array.from(main.querySelectorAll(":scope > * > section"));
      const all = Array.from(new Set([...candidates, ...nested])) as HTMLElement[];

      const result: DetectedSectionRef[] = all
        .filter((el) => {
          // Skip empty wrappers and sentinel elements (header/footer rendered
          // outside <main> are already excluded by the :scope query).
          const rect = el.getBoundingClientRect();
          return rect.height > 50;
        })
        .map((el, idx) => {
          const key = `section_${idx + 1}`;
          el.setAttribute("data-reveal-key", key);
          el.setAttribute("data-reveal-page", page);
          return { key, label: `Section ${idx + 1}`, element: el };
        });

      setDetected(result);
      register(
        page,
        result.map((r) => ({ key: r.key, label: r.label, element: r.element }))
      );
    };

    // Run on next paint so all child components have mounted
    const t = window.setTimeout(scan, 50);
    // Re-scan if the DOM significantly changes (e.g. async content loads in)
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      window.setTimeout(scan, 80);
    });
    mo.observe(document.querySelector("main") || document.body, {
      childList: true,
      subtree: false,
    });

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      mo.disconnect();
    };
    // page only — register/getConfig are stable enough for our purposes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Apply animations + IntersectionObserver whenever detected sections or
  // their saved configs change.
  useEffect(() => {
    if (detected.length === 0) return;

    // Pre-stage: hide each section until it enters the viewport (so the
    // animation actually plays even if the section is above the fold).
    for (const s of detected) {
      const cfg = getConfig(s.key);
      const name = animationName(cfg.anim);
      // Reset any previously applied styles so changes take effect immediately
      s.element.style.removeProperty("animation");
      s.element.style.removeProperty("opacity");
      s.element.style.removeProperty("transform");
      s.element.style.removeProperty("filter");
      s.element.style.removeProperty("display");
      s.element.style.removeProperty("outline");
      s.element.style.removeProperty("outline-offset");
      // Reset child stagger
      Array.from(s.element.children).forEach((child) => {
        (child as HTMLElement).style.removeProperty("animation");
        (child as HTMLElement).style.removeProperty("opacity");
      });

      // Hidden sections should disappear from the live preview too so the
      // editor matches the public-facing page after a section is hidden.
      if (cfg.hidden) {
        s.element.style.display = "none";
        continue;
      }

      if (!name) continue;
      // Hide initially — IntersectionObserver re-shows + animates
      s.element.style.opacity = "0";
      s.element.dataset.revealPending = "1";
    }

    // Tear down old observer
    observerRef.current?.disconnect();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const key = el.getAttribute("data-reveal-key");
          if (!key) continue;
          const cfg = getConfig(key);
          const name = animationName(cfg.anim);
          if (!name) continue;

          // Apply the animation, then clear the staged opacity so the keyframe
          // takes over.
          el.style.animation = `${name} ${cfg.duration}ms cubic-bezier(0.22, 1, 0.36, 1) both`;
          el.style.removeProperty("opacity");
          delete el.dataset.revealPending;

          // Stagger direct children if requested
          if (cfg.stagger > 0) {
            Array.from(el.children).forEach((child, i) => {
              const c = child as HTMLElement;
              c.style.animation = `${name} ${cfg.duration}ms cubic-bezier(0.22, 1, 0.36, 1) both`;
              c.style.animationDelay = `${i * cfg.stagger}ms`;
            });
          }

          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    detected.forEach((s) => {
      const cfg = getConfig(s.key);
      if (!cfg.hidden && cfg.anim !== "none") io.observe(s.element);
    });

    observerRef.current = io;
    return () => io.disconnect();
  }, [detected, items, getConfig, enabled]);

  // Render the in-context floating chips (only in Edit Mode)
  if (!enabled) return null;
  return (
    <>
      {detected.map((s) => (
        <SectionRevealChip key={s.key} page={page} sectionKey={s.key} label={s.label} element={s.element} />
      ))}
    </>
  );
};

interface ChipProps {
  page: string;
  sectionKey: string;
  label: string;
  element: HTMLElement;
}

// ─── Reveal presets (localStorage-backed, shared across all sections/pages) ───
interface RevealPreset {
  name: string;
  anim: RevealType;
  duration: number;
  stagger: number;
}
const PRESETS_KEY = "reveal-presets-v1";
const loadPresets = (): RevealPreset[] => {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? (JSON.parse(raw) as RevealPreset[]) : [];
  } catch {
    return [];
  }
};
const savePresets = (list: RevealPreset[]) => {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("reveal-presets-changed"));
};

/**
 * Renders a small floating chip absolutely-positioned near the top-right of
 * each detected section. Uses createPortal directly into the section so it
 * positions correctly regardless of layout.
 */
const SectionRevealChip = ({ page, sectionKey, label, element }: ChipProps) => {
  const { getConfig, setConfig, items } = useSectionReveals(page);
  const cfg = getConfig(sectionKey);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  // Confirmation dialog state for wiping this section's reveal config.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [presets, setPresets] = useState<RevealPreset[]>(() => loadPresets());

  // Keep presets in sync across all chips on the page
  useEffect(() => {
    const sync = () => setPresets(loadPresets());
    window.addEventListener("reveal-presets-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("reveal-presets-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Inject a portal host inside the section
  useEffect(() => {
    const wrapper = document.createElement("div");
    wrapper.className = "reveal-chip-host";
    wrapper.style.position = "absolute";
    wrapper.style.top = "8px";
    wrapper.style.right = "8px";
    wrapper.style.zIndex = "40";
    wrapper.style.pointerEvents = "auto";
    // Make sure the section is positioned so absolute children work
    const computed = window.getComputedStyle(element);
    if (computed.position === "static") element.style.position = "relative";
    element.appendChild(wrapper);
    setHost(wrapper);
    return () => {
      wrapper.remove();
    };
  }, [element]);

  const handleAnim = async (anim: RevealType) => {
    setBusy(true);
    try {
      await setConfig(sectionKey, { anim });
      toast({ title: `${label} → ${REVEAL_OPTIONS.find((o) => o.value === anim)?.label}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleDuration = async (val: number) => {
    setBusy(true);
    try {
      await setConfig(sectionKey, { duration: val });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleStagger = async (val: number) => {
    setBusy(true);
    try {
      await setConfig(sectionKey, { stagger: val });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleHidden = async () => {
    setBusy(true);
    try {
      await setConfig(sectionKey, { hidden: !cfg.hidden });
      toast({
        title: cfg.hidden
          ? `${label} is now visible`
          : `${label} hidden from public site`,
      });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleSavePreset = () => {
    const name = window.prompt(
      "Preset name",
      `${cfg.anim} ${cfg.duration}ms`
    )?.trim();
    if (!name) return;
    const next = [
      ...presets.filter((p) => p.name !== name),
      { name, anim: cfg.anim, duration: cfg.duration, stagger: cfg.stagger },
    ];
    savePresets(next);
    setPresets(next);
    toast({ title: `Saved preset “${name}”` });
  };

  const handleApplyPreset = async (p: RevealPreset) => {
    setBusy(true);
    try {
      await setConfig(sectionKey, { anim: p.anim, duration: p.duration, stagger: p.stagger });
      toast({ title: `Applied preset “${p.name}”` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePreset = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    savePresets(next);
    setPresets(next);
  };

  /**
   * Persistently hide this section from the public site without deleting its
   * content, so it does not snap back to defaults after refresh.
   */
  const handleDeleteSection = async () => {
    setDeleting(true);
    try {
      await setConfig(sectionKey, { hidden: true });
      toast({
        title: `${label} hidden`,
        description: "The section is now hidden on the public site and will stay hidden until you show it again.",
      });
      setConfirmDelete(false);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (!host) return null;
  return createPortal(
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-border shadow-md text-xs text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={`Reveal: ${cfg.anim} · ${cfg.duration}ms · stagger ${cfg.stagger}ms`}
        >
          <Sparkles size={11} />
          <span className="font-medium">{label}</span>
          <span className="text-[10px] opacity-70">·</span>
          <span className="text-[10px]">{cfg.anim}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Wand2 size={12} className="text-accent" />
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Animation
              </div>
            </div>
            <button
              type="button"
              onClick={handleHidden}
              disabled={busy}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                cfg.hidden
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={cfg.hidden ? "Section is hidden — click to show" : "Hide this section on the public site"}
            >
              {cfg.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
              {cfg.hidden ? "Hidden" : "Hide"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {REVEAL_OPTIONS.map((opt) => {
              const active = cfg.anim === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAnim(opt.value)}
                  disabled={busy}
                  className={`px-2 py-1.5 text-xs rounded-md transition-colors text-left ${
                    active
                      ? "bg-accent/15 text-accent font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                  title={opt.hint}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
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
            disabled={busy || cfg.anim === "none"}
            onValueCommit={(v) => handleDuration(v[0])}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Child stagger
            </div>
            <div className="text-xs font-mono text-foreground">{cfg.stagger}ms</div>
          </div>
          <Slider
            value={[cfg.stagger]}
            min={0}
            max={300}
            step={10}
            disabled={busy || cfg.anim === "none"}
            onValueCommit={(v) => handleStagger(v[0])}
          />
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
            Delay between each direct child element (0 = whole section animates together).
          </p>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Bookmark size={12} className="text-accent" />
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Presets
              </div>
            </div>
            <button
              type="button"
              onClick={handleSavePreset}
              disabled={busy}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-accent hover:bg-accent/10 transition-colors"
              title="Save current animation, duration & stagger as a reusable preset"
            >
              + Save current
            </button>
          </div>
          {presets.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/70 leading-tight">
              No presets yet. Save the current settings to reuse on other sections.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {presets.map((p) => (
                <div
                  key={p.name}
                  className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-muted hover:bg-accent/10 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    disabled={busy}
                    className="text-xs text-foreground hover:text-accent"
                    title={`${p.anim} · ${p.duration}ms · stagger ${p.stagger}ms`}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(p.name)}
                    className="opacity-40 hover:opacity-100 hover:text-destructive p-0.5 rounded"
                    title="Delete preset"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*
          Destructive zone — wipes this section's reveal config only. Wrapped
          in an AlertDialog so accidental clicks can't nuke the settings.
        */}
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy || deleting}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/30 transition-colors disabled:opacity-50"
            title="Hide this section from the public site"
          >
            <Trash2 size={12} />
            Hide section
          </button>
        </div>
      </PopoverContent>

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(open) => { if (!open && !deleting) setConfirmDelete(false); }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide “{label}” from the website?</AlertDialogTitle>
            <AlertDialogDescription>
              This keeps the section content intact but hides the whole section
              from the public site until you show it again in edit mode.
              <br />
              <br />
              Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSection();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Hiding…" : "Yes, hide"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>,
    host
  );
};

export default RevealAutoScanner;
