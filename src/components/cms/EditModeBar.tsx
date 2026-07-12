import { useEffect, useState } from "react";
import { Pencil, Eye, Save, Undo2, Loader2, X, ExternalLink } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEditMode } from "./EditModeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFeatureBySlug } from "@/hooks/useFeatures";

/**
 * Floating toolbar visible only to admins. Lets them toggle edit mode,
 * see the unsaved-change count, save everything, or discard.
 *
 * The bar auto-hides while a Radix Dialog/Sheet is open so it never overlaps
 * a modal's footer (e.g. the Reorder industries dialog's Save button).
 */
const EditModeBar = () => {
  const { canEdit, enabled, toggle, pending, saveAll, discardAll, saving } = useEditMode();
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const count = Object.keys(pending).length;

  // If we're on /features/<slug>, look up the row id so the admin deep-link
  // can auto-open the FeaturesManager edit dialog for it.
  const featureSlugMatch = location.pathname.match(/^\/features\/([^/]+)$/);
  const featureSlug = featureSlugMatch?.[1];
  const { data: featureRow } = useFeatureBySlug(featureSlug);

  // Hide whenever a modal overlay is mounted — Radix Dialog & Sheet both
  // render `[data-state="open"]` on their root, and AlertDialog uses an
  // overlay with role="dialog". We watch the DOM for any of those.
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (!canEdit) return;
    const check = () => {
      const hasModal = !!document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
      );
      setModalOpen(hasModal);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, [canEdit]);

  if (!canEdit) return null;
  if (modalOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="pointer-events-auto bg-card/95 backdrop-blur border border-border shadow-2xl rounded-full px-2 py-2 flex items-center gap-1">
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            enabled
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-foreground hover:bg-muted/70"
          }`}
        >
          {enabled ? <Eye size={13} /> : <Pencil size={13} />}
          {enabled ? "Preview" : "Edit page"}
        </button>

        {enabled && (
          <>
            <div className="h-5 w-px bg-border mx-1" />

            {/* Language pills (so admins can switch which language they edit) */}
            <div className="flex bg-muted rounded-full p-0.5 text-[10px] font-bold">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-full uppercase ${
                    lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-border mx-1" />

            <span className="text-xs text-muted-foreground px-2">
              {count === 0 ? "No changes" : `${count} change${count === 1 ? "" : "s"}`}
            </span>

            <button
              onClick={discardAll}
              disabled={count === 0 || saving}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
              title="Discard all changes"
            >
              <Undo2 size={13} />
            </button>

            <button
              onClick={saveAll}
              disabled={count === 0 || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving..." : "Save all"}
            </button>

            {featureRow?.id && (
              <>
                <div className="h-5 w-px bg-border mx-1" />
                <button
                  onClick={() => navigate(`/admin?tab=features&edit=${featureRow.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-semibold hover:bg-muted/70"
                  title="Open this feature in the admin"
                >
                  <ExternalLink size={13} />
                  Open in admin
                </button>
              </>
            )}
          </>
        )}
      </div>

      {enabled && count === 0 && (
        <p className="text-[11px] text-center text-muted-foreground mt-2 bg-card/80 backdrop-blur rounded-full px-3 py-1 border border-border max-w-xs mx-auto">
          Click any text or image to edit it. Switch language with EN/AR.
        </p>
      )}
    </div>
  );
};

export default EditModeBar;
