import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ImagePlus, Type as TypeIcon, Video as VideoIcon, Upload, Link as LinkIcon, Loader2, MousePointerClick, Settings2, Mail, Phone, MessageCircle, ExternalLink, Sparkles, X as XIcon, ChevronUp, ChevronDown, BookmarkPlus, icons as lucideIcons } from "lucide-react";
import LucideIconPicker from "./LucideIconPicker";
import { useEditMode } from "./EditModeContext";
import { useSiteContent, useSaveContent, useDeleteContent, useUploadCmsImage } from "@/hooks/useSiteContent";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import VisualSlot from "./VisualSlot";
import MediaPicker from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CtaKind, targetToAnchor } from "@/hooks/useCtaTargets";
import { trackCtaClick } from "@/lib/trackCtaClick";

/**
 * Storage convention for custom blocks:
 *   page=<page>, section="custom_blocks"
 *   content_key = "block_<id>__<field>"
 *     fields: "type"     (text | image | video | text_image | button)
 *             "title"    (rich text)
 *             "body"     (rich text)
 *             "media"    (image_url for image type / video URL for video type)
 *             "label"    (button text — rich, EN/AR)
 *             "kind"     (button destination kind: link|email|phone|whatsapp|external)
 *             "value"    (button destination value: "/pricing", "hi@x.com", "+9715…", "https://…")
 *             "variant"  (button style: default|outline|secondary|ghost)
 *             "align"    (left|center|right) — only for button block
 *             "icon"     (Lucide icon name prepended before label, e.g. "Phone")
 *   sort_order = display order
 *
 * The `type` row holds the block type as `value`. Listing all rows starting
 * with `block_<id>__type` reconstructs the block list.
 */

type BlockType = "text" | "image" | "video" | "text_image" | "button";

type BlockPreset = {
  key: string;
  title: string;
  description: string;
  type: BlockType;
  seed?: Record<string, string>;
};

type BlockSeedField = {
  field: string;
  value: string;
  value_ar?: string | null;
  content_type?: string;
};

type SavedBlockPreset = {
  id: string;
  name: string;
  type: BlockType;
  seed: BlockSeedField[];
};

interface BlockRecord {
  id: string;
  type: BlockType;
  sortOrder: number;
}

const blockKey = (id: string, field: string) => `block_${id}__${field}`;

const BLOCK_PRESETS: BlockPreset[] = [
  {
    key: "intro-text",
    title: "Intro text",
    description: "Headline with supporting paragraph.",
    type: "text",
    seed: {
      title: "Section headline",
      body: "Add a short supporting paragraph for this section.",
    },
  },
  {
    key: "media-feature",
    title: "Text + image",
    description: "Two-column feature section with media.",
    type: "text_image",
    seed: {
      title: "Feature spotlight",
      body: "Describe the key value of this section and why it matters.",
    },
  },
  {
    key: "cta-row",
    title: "CTA row",
    description: "Ready-made action block with a button.",
    type: "button",
    seed: {
      label: "Get started",
      value: "/contact",
      kind: "link",
      variant: "default",
      align: "center",
      buttons: JSON.stringify([
        { id: "primary", kind: "link", value: "/contact", variant: "default", icon: "" },
      ]),
    },
  },
];

const BLOCK_PRESETS_STORAGE_KEY = "cms-block-presets-v1";

const loadSavedBlockPresets = (): SavedBlockPreset[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BLOCK_PRESETS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedBlockPreset[]) : [];
  } catch {
    return [];
  }
};

const persistSavedBlockPresets = (presets: SavedBlockPreset[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BLOCK_PRESETS_STORAGE_KEY, JSON.stringify(presets));
  window.dispatchEvent(new Event("cms-block-presets-changed"));
};

/** Render all custom blocks for a page (visible to everyone). */
export const CustomBlocksRenderer = forwardRef<HTMLDivElement, { page: string }>(({ page }, ref) => {
  const { items } = useSiteContent(page, "custom_blocks");
  const saveContent = useSaveContent();
  const { toast } = useToast();
  const blocks = useMemo<BlockRecord[]>(() => {
    return (items ?? [])
      .filter((i) => i.content_key.endsWith("__type"))
      .map((i) => ({
        id: i.content_key.replace(/^block_/, "").replace(/__type$/, ""),
        type: (i.value as BlockType) || "text_image",
        sortOrder: i.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items]);

  const moveBlock = async (blockId: string, dir: -1 | 1) => {
    const currentIndex = blocks.findIndex((b) => b.id === blockId);
    const nextIndex = currentIndex + dir;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= blocks.length) return;

    const nextBlocks = [...blocks];
    const [moved] = nextBlocks.splice(currentIndex, 1);
    nextBlocks.splice(nextIndex, 0, moved);
    const nextSortOrder = new Map(nextBlocks.map((block, index) => [block.id, (index + 1) * 10]));

    try {
      await Promise.all(
        items.map((item) => {
          const blockIdForRow = item.content_key.match(/^block_([^_]+)__/)?.[1];
          if (!blockIdForRow) return Promise.resolve();
          const sort_order = nextSortOrder.get(blockIdForRow);
          if (sort_order === undefined || sort_order === item.sort_order) return Promise.resolve();

          return saveContent.mutateAsync({
            id: item.id,
            page: item.page,
            section: item.section,
            content_key: item.content_key,
            value: item.value,
            value_ar: item.value_ar ?? undefined,
            content_type: item.content_type,
            sort_order,
          });
        })
      );
    } catch (err: any) {
      toast({ title: "Reorder failed", description: err.message, variant: "destructive" });
    }
  };

  if (blocks.length === 0) return null;

  return (
    <div ref={ref} className="contents">
      {blocks.map((b, index) => (
        <CustomBlock
          key={b.id}
          page={page}
          block={b}
          canMoveUp={index > 0}
          canMoveDown={index < blocks.length - 1}
          onMove={moveBlock}
        />
      ))}
    </div>
  );
});

CustomBlocksRenderer.displayName = "CustomBlocksRenderer";

const CustomBlock = ({
  page,
  block,
  canMoveUp,
  canMoveDown,
  onMove,
}: {
  page: string;
  block: BlockRecord;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (blockId: string, dir: -1 | 1) => void | Promise<void>;
}) => {
  const { enabled, items: allItems } = useEditMode();
  const { toast } = useToast();
  const deleteContent = useDeleteContent();
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Find the existing rows for this block (so we can delete them)
  const blockRows = useMemo(() => {
    return (allItems ?? []).filter(
      (i) => i.page === page && i.section === "custom_blocks" && i.content_key.startsWith(`block_${block.id}__`)
    );
  }, [allItems, page, block.id]);

  const remove = async () => {
    if (!window.confirm("Delete this block? This cannot be undone.")) return;
    try {
      for (const r of blockRows) await deleteContent.mutateAsync(r.id);
      toast({ title: "Block deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const saveAsPreset = async () => {
    const name = presetName.trim();
    if (!name) return;
    const seed = blockRows
      .filter((row) => row.content_key !== blockKey(block.id, "type"))
      .map((row) => ({
        field: row.content_key.replace(`block_${block.id}__`, ""),
        value: row.value,
        value_ar: row.value_ar,
        content_type: row.content_type,
      }));

    setSavingPreset(true);
    try {
      const next = [
        ...loadSavedBlockPresets().filter((preset) => preset.name !== name),
        {
          id: Math.random().toString(36).slice(2, 10),
          name,
          type: block.type,
          seed,
        },
      ];
      persistSavedBlockPresets(next);
      toast({ title: `Saved preset “${name}”` });
      setPresetDialogOpen(false);
      setPresetName("");
    } catch (err: any) {
      toast({ title: "Preset save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingPreset(false);
    }
  };

  // Read the video URL (stored as text)
  const videoUrl =
    blockRows.find((r) => r.content_key === blockKey(block.id, "media"))?.value || "";

  return (
    <section className="section-padding bg-background relative">
      {enabled && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          <button
            onClick={() => onMove(block.id, -1)}
            disabled={!canMoveUp}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            title="Move block up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMove(block.id, 1)}
            disabled={!canMoveDown}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            title="Move block down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={remove}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Delete block"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => {
              setPresetName(`${block.type} preset`);
              setPresetDialogOpen(true);
            }}
            disabled={savingPreset}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            title="Save block as preset"
          >
            <BookmarkPlus size={14} />
          </button>
        </div>
      )}
      {enabled && presetDialogOpen && (
        <div className="absolute top-12 right-3 z-30 w-72 rounded-lg border border-border bg-card p-3 shadow-xl space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Save block preset</div>
            <p className="text-xs text-muted-foreground">Reuse this block in the add block menu on any page.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`preset-name-${block.id}`}>Preset name</Label>
            <Input
              id={`preset-name-${block.id}`}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Feature CTA"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPresetDialogOpen(false)} disabled={savingPreset}>Cancel</Button>
            <Button size="sm" onClick={saveAsPreset} disabled={savingPreset || !presetName.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {savingPreset ? "Saving…" : "Save preset"}
            </Button>
          </div>
        </div>
      )}
      <div className="container-max">
        {block.type === "text" && (
          <div className="max-w-3xl mx-auto text-center">
            <EditableText
              as="h2"
              page={page}
              section="custom_blocks"
              contentKey={blockKey(block.id, "title")}
              fallback="Add a heading"
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              rich
            />
            <EditableText
              as="p"
              page={page}
              section="custom_blocks"
              contentKey={blockKey(block.id, "body")}
              fallback="Click here to write your content. You can format it with the floating toolbar."
              multiline
              className="text-muted-foreground text-lg"
              rich
            />
          </div>
        )}

        {block.type === "image" && (
          <div className="max-w-4xl mx-auto">
            <EditableImage
              page={page}
              slotKey={blockKey(block.id, "media")}
              alt="Block image"
              className="w-full"
              imgClassName="w-full h-auto rounded-2xl object-contain"
            >
              <div className="w-full aspect-video rounded-2xl bg-muted/40 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                <ImagePlus size={32} />
                <span className="ml-2 text-sm">Click "Add image" above to upload</span>
              </div>
            </EditableImage>
          </div>
        )}

        {block.type === "video" && (
          <div className="max-w-4xl mx-auto">
            <VideoBlockEditor page={page} blockId={block.id} url={videoUrl} />
          </div>
        )}

        {block.type === "text_image" && (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            <div>
              <EditableText
                as="h2"
                page={page}
                section="custom_blocks"
                contentKey={blockKey(block.id, "title")}
                fallback="Your headline"
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                rich
              />
              <EditableText
                as="p"
                page={page}
                section="custom_blocks"
                contentKey={blockKey(block.id, "body")}
                fallback="Add a description that explains the value of this section to your visitors."
                multiline
                className="text-muted-foreground"
                rich
              />
            </div>
            <EditableImage
              page={page}
              slotKey={blockKey(block.id, "media")}
              alt="Block image"
            >
              <div className="w-full aspect-video rounded-2xl bg-muted/40 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                <ImagePlus size={32} />
                <span className="ml-2 text-sm">Click "Add image" above</span>
              </div>
            </EditableImage>
          </div>
        )}

        {block.type === "button" && (
          <ButtonBlock page={page} blockId={block.id} />
        )}
      </div>
    </section>
  );
};

/** Video block: stores YouTube/Vimeo/MP4 URL or uploaded file URL and renders the right embed */
const VideoBlockEditor = ({ page, blockId, url }: { page: string; blockId: string; url: string }) => {
  const { enabled } = useEditMode();
  const saveContent = useSaveContent();
  const uploadFile = useUploadCmsImage();
  const { items } = useSiteContent(page, "custom_blocks");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [draft, setDraft] = useState(url);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const existing = items.find(
    (i) => i.content_key === blockKey(blockId, "media") && i.section === "custom_blocks"
  );

  const persist = async (value: string) => {
    await saveContent.mutateAsync({
      id: existing?.id,
      page,
      section: "custom_blocks",
      content_key: blockKey(blockId, "media"),
      value,
      content_type: "text",
      sort_order: existing?.sort_order ?? 0,
    });
  };

  const saveUrl = async () => {
    try {
      await persist(draft.trim());
      toast({ title: "Video updated" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpload = async (file: File) => {
    // Client-side guard rails
    if (!file.type.startsWith("video/")) {
      toast({ title: "Not a video", description: "Please pick a video file.", variant: "destructive" });
      return;
    }
    const MAX = 50 * 1024 * 1024;
    if (file.size > MAX) {
      toast({
        title: "File too large",
        description: `Max 50 MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)} MB. For longer videos, paste a YouTube/Vimeo link instead.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(10);
    try {
      const safeName = file.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
      const path = `videos/${page}-${blockId}-${Date.now()}-${safeName}`;
      // Fake progress while uploading (Supabase JS doesn't expose progress yet)
      const tick = setInterval(() => setProgress((p) => Math.min(p + 7, 90)), 300);
      const publicUrl = await uploadFile.mutateAsync({ file, path });
      clearInterval(tick);
      setProgress(100);
      await persist(publicUrl);
      toast({ title: "Video uploaded" });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Please try a smaller file or use a URL instead.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const embed = toEmbedSrc(url);

  return (
    <div className="relative">
      {embed ? (
        embed.kind === "iframe" ? (
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              src={embed.src}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        ) : (
          <video
            src={embed.src}
            className="w-full rounded-2xl bg-black"
            controls
            playsInline
          />
        )
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-muted/40 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-2">
          <VideoIcon size={32} />
          <span className="text-sm">{enabled ? "Click 'Set video' below" : "No video set"}</span>
        </div>
      )}

      {enabled && (
        <div className="mt-3 text-center flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(url);
              setMode(url && /^https?:\/\//.test(url) && !url.includes("/cms-images/") ? "url" : "upload");
              setOpen(true);
            }}
            className="gap-1.5"
          >
            <VideoIcon size={14} /> {url ? "Change video" : "Set video"}
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!window.confirm("Remove this video?")) return;
                try {
                  await persist("");
                  toast({ title: "Video removed" });
                } catch (err: any) {
                  toast({ title: "Failed", description: err.message, variant: "destructive" });
                }
              }}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 size={14} /> Remove
            </Button>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !uploading && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set video</DialogTitle>
            <DialogDescription>
              Paste a link or upload a video file (max 50 MB).
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border -mb-px">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                mode === "url"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon size={14} /> URL
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                mode === "upload"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload size={14} /> Upload
            </button>
          </div>

          {mode === "url" ? (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=… or https://…/video.mp4"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Supports YouTube, Vimeo, and direct .mp4/.webm links.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent hover:bg-accent/5 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-accent" size={24} />
                    <span className="text-sm text-foreground">Uploading…</span>
                    <Progress value={progress} className="w-full max-w-xs h-1.5" />
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-accent mb-2" size={24} />
                    <div className="text-sm font-medium text-foreground">Click to choose a video</div>
                    <div className="text-[11px] text-muted-foreground mt-1">MP4, WebM, MOV — up to 50 MB</div>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
            {mode === "url" && (
              <Button onClick={saveUrl} disabled={uploading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Save URL
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Convert a URL into an embeddable src or direct video src. */
const toEmbedSrc = (url: string): { kind: "iframe" | "video"; src: string } | null => {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  // Vimeo
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return { kind: "iframe", src: `https://player.vimeo.com/video/${v[1]}` };
  // Direct video file
  if (/\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url)) return { kind: "video", src: url };
  // Fallback: assume iframe
  return { kind: "iframe", src: url };
};

/**
 * Button block. Lets admins drop one OR multiple CTA buttons in a single block
 * (e.g. primary "Get started" + secondary "Talk to sales") and configure each
 * one's destination kind:
 *   • Internal page link (/pricing)
 *   • Email (mailto:)
 *   • Phone (tel:)
 *   • WhatsApp (wa.me)
 *   • External URL
 *
 * Storage:
 *   block_<id>__buttons    — JSON array of button configs (no labels — those
 *                            live in their own editable rows so EditableText
 *                            can write EN/AR independently):
 *     [{ id: string, kind, value, variant, icon }]
 *   block_<id>__btn_<bid>__label  — per-button rich label (EN + AR via value_ar)
 *   block_<id>__align      — block-level alignment (left|center|right)
 *
 * Backwards compatibility: legacy single-button blocks that wrote
 *   block_<id>__label / __kind / __value / __variant / __icon
 * are auto-rendered as a one-button group (id="legacy") and migrated on first
 * save in the settings dialog.
 *
 * Reuses targetToAnchor() from useCtaTargets so href / target / rel logic
 * matches the rest of the site's CTAs.
 */
const KIND_META: Record<CtaKind, { label: string; icon: typeof LinkIcon; placeholder: string; hint: string }> = {
  link:     { label: "Internal page",  icon: LinkIcon,        placeholder: "/pricing", hint: "Page on this site, e.g. /pricing or /contact" },
  email:    { label: "Email",          icon: Mail,            placeholder: "hello@digitizeme.ae", hint: "Opens the visitor's email app" },
  phone:    { label: "Phone",          icon: Phone,           placeholder: "+971 4 123 4567", hint: "Opens the dialer on mobile" },
  whatsapp: { label: "WhatsApp",       icon: MessageCircle,   placeholder: "+971501234567", hint: "Opens WhatsApp chat (numbers only)" },
  external: { label: "External URL",   icon: ExternalLink,    placeholder: "https://example.com", hint: "Opens in a new tab" },
};

type ButtonVariant = "default" | "outline" | "secondary" | "ghost";
type ButtonAlign = "left" | "center" | "right";

interface ButtonConfig {
  id: string;
  kind: CtaKind;
  value: string;
  variant: ButtonVariant;
  icon: string; // Lucide icon name, "" = none
}

const newButtonId = () => Math.random().toString(36).slice(2, 8);

const makeButton = (overrides: Partial<ButtonConfig> = {}): ButtonConfig => ({
  id: overrides.id ?? newButtonId(),
  kind: overrides.kind ?? "link",
  value: overrides.value ?? "",
  variant: overrides.variant ?? "default",
  icon: overrides.icon ?? "",
});

/** Per-button label row key. Legacy id "legacy" maps to the old block-level "label" row. */
const buttonLabelKey = (blockId: string, btnId: string) =>
  btnId === "legacy" ? blockKey(blockId, "label") : blockKey(blockId, `btn_${btnId}__label`);


/** Parse the JSON `buttons` array; returns null if malformed. */
const parseButtons = (raw?: string): ButtonConfig[] | null => {
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr.map((b) => makeButton(b as Partial<ButtonConfig>));
  } catch {
    return null;
  }
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
};
const SIZE_CLASSES = "h-11 rounded-md px-8 text-base"; // matches Button size="lg"
const BUTTON_BASE = `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${SIZE_CLASSES}`;

const ButtonBlock = forwardRef<HTMLDivElement, { page: string; blockId: string }>(({ page, blockId }, ref) => {
  const { enabled } = useEditMode();
  const { items } = useSiteContent(page, "custom_blocks");
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const findRow = (field: string) =>
    items.find((i) => i.content_key === blockKey(blockId, field));

  // Read current state. Prefer the new `buttons` JSON row; fall back to the
  // legacy single-button fields for backwards compatibility.
  const buttonsRow = findRow("buttons");
  const alignRow = findRow("align");
  const align = ((alignRow?.value as ButtonAlign) || "center");

  const buttons: ButtonConfig[] = useMemo(() => {
    const parsed = parseButtons(buttonsRow?.value);
    if (parsed && parsed.length > 0) return parsed;
    // Legacy fallback: single button stitched from old per-field rows
    const legacyKind = (findRow("kind")?.value as CtaKind) || "link";
    const legacyValue = findRow("value")?.value || "";
    const legacyVariant = (findRow("variant")?.value as ButtonVariant) || "default";
    const legacyIcon = findRow("icon")?.value || "";
    return [makeButton({ id: "legacy", kind: legacyKind, value: legacyValue, variant: legacyVariant, icon: legacyIcon })];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Local draft state for the settings dialog
  const [draftButtons, setDraftButtons] = useState<ButtonConfig[]>(buttons);
  const [draftAlign, setDraftAlign] = useState<ButtonAlign>(align);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openDialog = () => {
    setDraftButtons(buttons.length ? buttons : [makeButton()]);
    setDraftAlign(align);
    setOpen(true);
  };

  const updateDraft = (id: string, patch: Partial<ButtonConfig>) => {
    setDraftButtons((arr) => arr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const addDraftButton = () => {
    setDraftButtons((arr) => [...arr, makeButton({ variant: "outline" })]);
  };
  const removeDraftButton = (id: string) => {
    setDraftButtons((arr) => (arr.length <= 1 ? arr : arr.filter((b) => b.id !== id)));
  };
  const moveDraftButton = (id: string, dir: -1 | 1) => {
    setDraftButtons((arr) => {
      const i = arr.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return arr;
      const copy = [...arr];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Persist the buttons array as JSON
      await saveContent.mutateAsync({
        id: buttonsRow?.id,
        page,
        section: "custom_blocks",
        content_key: blockKey(blockId, "buttons"),
        value: JSON.stringify(draftButtons),
        content_type: "text",
        sort_order: 0,
      });
      // Persist alignment
      await saveContent.mutateAsync({
        id: alignRow?.id,
        page,
        section: "custom_blocks",
        content_key: blockKey(blockId, "align"),
        value: draftAlign,
        content_type: "text",
        sort_order: 0,
      });
      // Cleanup: drop legacy per-field rows once we've migrated to the JSON model
      const legacyFields = ["kind", "value", "variant", "icon"];
      for (const f of legacyFields) {
        const row = findRow(f);
        if (row) await deleteContent.mutateAsync(row.id);
      }
      toast({ title: "Buttons updated" });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const alignClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  /**
   * Fire a "cta_click" event for this Button block. Uses the shared
   * `trackCtaClick` util so registry CTAs and custom buttons land in the
   * same analytics event with consistent payload shape.
   */
  const trackButtonClick = (btn: ButtonConfig, labelText: string, destination: string) => {
    trackCtaClick({
      label: labelText,
      destination,
      kind: btn.kind,
      page,
      source: blockId,
      button_id: btn.id,
      variant: btn.variant,
      registry: false,
    });
  };

  // Render a single button (anchor / Link / non-clickable preview)
  const renderButton = (btn: ButtonConfig) => {
    const anchor = targetToAnchor({ kind: btn.kind, value: btn.value });
    const Icon = btn.icon
      ? (lucideIcons[btn.icon as keyof typeof lucideIcons] as React.ComponentType<{ size?: number; className?: string }> | undefined)
      : undefined;
    const cls = `${BUTTON_BASE} ${variantClasses[btn.variant]}`;
    const labelNode = (
      <>
        {Icon && <Icon size={16} className="shrink-0" />}
        <EditableText
          page={page}
          section="custom_blocks"
          contentKey={buttonLabelKey(blockId, btn.id)}
          fallback="Click to edit label"
          className="inline"
        />
      </>
    );
    if (!btn.value && !enabled) return null;

    // Read the rendered label text from the DOM so we capture whatever the
    // admin typed (incl. AR translations) without re-querying site_content.
    const handleTrack = (e: React.MouseEvent<HTMLElement>) => {
      const labelText =
        (e.currentTarget.textContent || "").trim().replace(/\s+/g, " ") || btn.id;
      trackButtonClick(btn, labelText, btn.value);
    };

    if (anchor) {
      return (
        <a
          key={btn.id}
          href={btn.value ? anchor.href : undefined}
          {...(anchor.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cls}
          onClick={(e) => {
            if (!btn.value) { e.preventDefault(); return; }
            // Don't track clicks while admins are editing the label
            if (enabled) return;
            handleTrack(e);
          }}
        >
          {labelNode}
        </a>
      );
    }
    if (btn.value) {
      return (
        <Link
          key={btn.id}
          to={btn.value}
          className={cls}
          onClick={(e) => { if (!enabled) handleTrack(e); }}
        >
          {labelNode}
        </Link>
      );
    }
    return (
      <span key={btn.id} className={`${cls} opacity-70 cursor-default`} title="No destination set">
        {labelNode}
      </span>
    );
  };

  const renderedButtons = buttons.map(renderButton).filter(Boolean);
  if (renderedButtons.length === 0 && !enabled) return null;

  return (
    <div ref={ref} className={`max-w-3xl mx-auto flex flex-wrap ${alignClass} items-center gap-3`}>
      {renderedButtons}

      {enabled && (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Configure buttons"
        >
          <Settings2 size={13} />
          Configure ({buttons.length})
        </button>
      )}

      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buttons in this block</DialogTitle>
            <DialogDescription>
              Add one or more buttons (e.g. a primary "Get started" plus a secondary "Talk to sales"). Edit each label by clicking it on the page after saving.
            </DialogDescription>
          </DialogHeader>

          {/* Block-level alignment */}
          <div className="space-y-1.5">
            <Label>Alignment</Label>
            <Select value={draftAlign} onValueChange={(v) => setDraftAlign(v as ButtonAlign)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Per-button editors */}
          <div className="space-y-3">
            {draftButtons.map((btn, idx) => {
              const PickedIcon = btn.icon
                ? (lucideIcons[btn.icon as keyof typeof lucideIcons] as React.ComponentType<{ size?: number; className?: string }> | undefined)
                : undefined;
              return (
                <div key={btn.id} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Button {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => moveDraftButton(btn.id, -1)} disabled={idx === 0} title="Move up">
                        <ChevronUp size={14} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => moveDraftButton(btn.id, 1)} disabled={idx === draftButtons.length - 1} title="Move down">
                        <ChevronDown size={14} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeDraftButton(btn.id)} disabled={draftButtons.length <= 1} title="Remove button">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Destination type</Label>
                      <Select value={btn.kind} onValueChange={(v) => updateDraft(btn.id, { kind: v as CtaKind })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.entries(KIND_META) as [CtaKind, typeof KIND_META[CtaKind]][]).map(([k, meta]) => {
                            const Ico = meta.icon;
                            return (
                              <SelectItem key={k} value={k}>
                                <span className="inline-flex items-center gap-2">
                                  <Ico size={14} /> {meta.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Style</Label>
                      <Select value={btn.variant} onValueChange={(v) => updateDraft(btn.id, { variant: v as ButtonVariant })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Filled (accent)</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="ghost">Ghost (no background)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination</Label>
                    <Input value={btn.value} onChange={(e) => updateDraft(btn.id, { value: e.target.value })}
                      placeholder={KIND_META[btn.kind].placeholder} />
                    <p className="text-[11px] text-muted-foreground">{KIND_META[btn.kind].hint}</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Icon (optional)</Label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setIconPickerFor(btn.id)}
                        className="flex-1 flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background text-sm hover:border-accent transition-colors text-left">
                        {PickedIcon ? (
                          <><PickedIcon size={16} className="text-accent" /><span className="text-foreground">{btn.icon}</span></>
                        ) : (
                          <><Sparkles size={14} className="text-muted-foreground" /><span className="text-muted-foreground">No icon — click to pick one</span></>
                        )}
                      </button>
                      {btn.icon && (
                        <Button type="button" variant="ghost" size="icon"
                          onClick={() => updateDraft(btn.id, { icon: "" })} title="Remove icon"
                          className="h-10 w-10 text-muted-foreground hover:text-destructive">
                          <XIcon size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={addDraftButton} className="w-full gap-2">
              <Plus size={14} /> Add another button
            </Button>
          </div>

          <LucideIconPicker
            open={iconPickerFor !== null}
            onOpenChange={(o) => !o && setIconPickerFor(null)}
            value={iconPickerFor ? draftButtons.find((b) => b.id === iconPickerFor)?.icon ?? null : null}
            onSelect={(name) => {
              if (iconPickerFor) updateDraft(iconPickerFor, { icon: name });
              setIconPickerFor(null);
            }}
            title="Pick a button icon"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveSettings} disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Save buttons"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ButtonBlock.displayName = "ButtonBlock";

/** Floating button visible only in edit mode that lets the admin add a new block */
export const AddBlockButton = forwardRef<HTMLDivElement, { page: string }>(({ page }, ref) => {
  const { enabled } = useEditMode();
  const { items } = useSiteContent(page, "custom_blocks");
  const saveContent = useSaveContent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedPresets, setSavedPresets] = useState<SavedBlockPreset[]>(() => loadSavedBlockPresets());

  useEffect(() => {
    const syncSavedPresets = () => setSavedPresets(loadSavedBlockPresets());
    window.addEventListener("cms-block-presets-changed", syncSavedPresets);
    window.addEventListener("storage", syncSavedPresets);
    return () => {
      window.removeEventListener("cms-block-presets-changed", syncSavedPresets);
      window.removeEventListener("storage", syncSavedPresets);
    };
  }, []);

  if (!enabled) return null;

  const addBlock = async (type: BlockType, seed?: Record<string, string>, seedFields?: BlockSeedField[]) => {
    const id = Math.random().toString(36).slice(2, 10);
    const maxSort = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
    setBusy(true);
    try {
      await saveContent.mutateAsync({
        page,
        section: "custom_blocks",
        content_key: blockKey(id, "type"),
        value: type,
        content_type: "text",
        sort_order: maxSort + 10,
      });
      const mergedSeedFields: BlockSeedField[] = [
        ...(seed
          ? Object.entries(seed).map(([field, value]) => ({ field, value, content_type: "text" as const }))
          : []),
        ...(seedFields ?? []),
      ];
      if (mergedSeedFields.length > 0) {
        await Promise.all(
          mergedSeedFields.map(({ field, value, value_ar, content_type }) =>
            saveContent.mutateAsync({
              page,
              section: "custom_blocks",
              content_key: blockKey(id, field),
              value,
              value_ar: value_ar ?? undefined,
              content_type: content_type ?? "text",
              sort_order: maxSort + 10,
            })
          )
        );
      }
      toast({ title: "Block added", description: "Scroll down — your new block is at the bottom." });
      setOpen(false);
      // Scroll to bottom so the user sees the new block
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 300);
    } catch (err: any) {
      toast({ title: "Failed to add block", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const options: { type: BlockType; title: string; desc: string; icon: typeof TypeIcon }[] = [
    { type: "text", title: "Text", desc: "Heading + paragraph", icon: TypeIcon },
    { type: "image", title: "Image", desc: "Single image, full width", icon: ImagePlus },
    { type: "video", title: "Video", desc: "YouTube, Vimeo, or MP4", icon: VideoIcon },
    { type: "text_image", title: "Text + Image", desc: "Two columns side-by-side", icon: ImagePlus },
    { type: "button", title: "Button", desc: "Link, email, phone, WhatsApp…", icon: MousePointerClick },
  ];

  return (
    <div ref={ref} className="contents">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-[100] bg-accent text-accent-foreground rounded-full px-4 py-3 shadow-2xl flex items-center gap-2 text-sm font-semibold hover:bg-accent/90 hover:scale-105 transition-all"
        title="Add a new block to this page"
      >
        <Plus size={16} />
        Add block
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a block</DialogTitle>
            <DialogDescription>
              Choose what to add. The block appears at the bottom of the page — you can edit it in place.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved presets</p>
            <div className="grid grid-cols-1 gap-2">
              {BLOCK_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  disabled={busy}
                  onClick={() => addBlock(preset.type, preset.seed)}
                  className="text-left p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50"
                >
                  <div className="font-semibold text-foreground text-sm">{preset.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                </button>
              ))}
              {savedPresets.map((preset) => (
                <button
                  key={preset.id}
                  disabled={busy}
                  onClick={() => addBlock(preset.type, undefined, preset.seed)}
                  className="text-left p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50"
                >
                  <div className="font-semibold text-foreground text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Saved {preset.type.replace("_", " + ")} preset</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2">
            {options.map((o) => (
              <button
                key={o.type}
                disabled={busy}
                onClick={() => addBlock(o.type)}
                className="text-left p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50"
              >
                <o.icon className="text-accent mb-2" size={20} />
                <div className="font-semibold text-foreground">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AddBlockButton.displayName = "AddBlockButton";
