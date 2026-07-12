import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Sparkles, Plus, Trash2, ArrowUp, ArrowDown, X, PanelRightOpen, Save, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { type FeatureSection, type FeatureRow } from "@/hooks/useFeatures";
import { useEditableFeature } from "@/hooks/useEditableFeature";
import CtaButton from "@/components/cms/CtaButton";
import EditableText from "@/components/cms/EditableText";
import EditableFeatureText from "@/components/cms/EditableFeatureText";
import EditableSectionText from "@/components/cms/EditableSectionText";
import EditableIcon from "@/components/cms/EditableIcon";
import EditableImage from "@/components/cms/EditableImage";
import AnimatedFeatureHero from "@/components/features/AnimatedFeatureHero";
import { useEditMode } from "@/components/cms/EditModeContext";
import SectionsEditor from "@/components/admin/SectionsEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const Icon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return null;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
};

type SectionControls = {
  canEdit: boolean;
  onAddItem: () => void;
  addItemLabel: string;
  onRemoveItem: (itemIdx: number) => void;
  onRemoveSection: () => void;
  onMoveSection: (dir: -1 | 1) => void;
  onInsertSection: (position: "above" | "below") => void;
  onOpenAdvanced: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const SectionToolbar = ({ controls }: { controls: SectionControls }) => {
  if (!controls.canEdit) return null;
  return (
    <div className="container-max px-4 -mb-4">
      <div className="flex flex-wrap items-center gap-2 justify-end text-xs">
        <button
          type="button"
          onClick={() => controls.onMoveSection(-1)}
          disabled={controls.isFirst}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" /> Up
        </button>
        <button
          type="button"
          onClick={() => controls.onMoveSection(1)}
          disabled={controls.isLast}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" /> Down
        </button>
        <button
          type="button"
          onClick={controls.onAddItem}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          title="Add a card to this section"
        >
          <Plus className="w-3 h-3" /> {controls.addItemLabel}
        </button>
        <button
          type="button"
          onClick={() => controls.onInsertSection("above")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted"
          title="Insert a section above"
        >
          <Plus className="w-3 h-3" /> Above
        </button>
        <button
          type="button"
          onClick={() => controls.onInsertSection("below")}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted"
          title="Insert a section below"
        >
          <Plus className="w-3 h-3" /> Below
        </button>
        <button
          type="button"
          onClick={controls.onOpenAdvanced}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted"
          title="Open advanced section editor"
        >
          <PanelRightOpen className="w-3 h-3" /> Advanced
        </button>
        <button
          type="button"
          onClick={controls.onRemoveSection}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
          title="Delete this section"
        >
          <Trash2 className="w-3 h-3" /> Delete section
        </button>
      </div>
    </div>
  );
};

const RemoveItemBadge = ({
  onClick,
  show,
}: {
  onClick: () => void;
  show: boolean;
}) => {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow hover:scale-110 transition"
      title="Remove this card"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
};

const SectionRenderer = ({
  feature,
  arrField,
  section,
  index,
  isRTL,
  isAr,
  controls,
  onItemChange,
  onFieldChange,
}: {
  feature: FeatureRow;
  arrField: "sections" | "sections_ar";
  section: FeatureSection;
  index: number;
  isRTL: boolean;
  isAr: boolean;
  controls: SectionControls;
  onItemChange: (
    arrField: "sections" | "sections_ar",
    sectionIdx: number,
    itemIdx: number,
    key: string,
    value: string
  ) => void;
  onFieldChange: (
    arrField: "sections" | "sections_ar",
    sectionIdx: number,
    key: keyof FeatureSection,
    value: any
  ) => void;
}) => {
  const idBase = `${feature.slug}/${arrField}/${index}`;
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  if (section.type === "feature_list") {
    return (
      <>
        <SectionToolbar controls={controls} />
        <section className="py-16 md:py-20">
          <div className="container-max px-4">
            {(section.title || true) && (
              <EditableSectionText
                as="h2"
                identity={`${idBase}/title`}
                value={section.title ?? ""}
                fallback={section.title ?? ""}
                rich
                onSave={(v) => onFieldChange(arrField, index, "title", v)}
                className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center block"
              />
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {(section.items ?? []).map((item, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow relative">
                  <RemoveItemBadge show={controls.canEdit} onClick={() => controls.onRemoveItem(i)} />
                  {item.icon && (
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Icon name={item.icon} className="w-6 h-6 text-accent" />
                    </div>
                  )}
                  <EditableSectionText
                    as="h3"
                    identity={`${idBase}/items/${i}/title`}
                    value={item.title ?? ""}
                    rich
                    onSave={(v) => onItemChange(arrField, index, i, "title", v)}
                    className="text-lg font-semibold text-foreground mb-2 block"
                  />
                  <EditableSectionText
                    as="p"
                    identity={`${idBase}/items/${i}/desc`}
                    value={item.desc ?? ""}
                    multiline
                    rich
                    onSave={(v) => onItemChange(arrField, index, i, "desc", v)}
                    className="text-sm text-muted-foreground block"
                  />
                </Card>
              ))}
              {controls.canEdit && (
                <button
                  type="button"
                  onClick={controls.onAddItem}
                  className="min-h-[140px] rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add card</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (section.type === "stats") {
    return (
      <>
        <SectionToolbar controls={controls} />
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container-max px-4">
            <EditableSectionText
              as="h2"
              identity={`${idBase}/title`}
              value={section.title ?? ""}
              rich
              onSave={(v) => onFieldChange(arrField, index, "title", v)}
              className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center block"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(section.items ?? []).map((item, i) => (
                <div key={i} className="text-center relative">
                  <RemoveItemBadge show={controls.canEdit} onClick={() => controls.onRemoveItem(i)} />
                  <EditableSectionText
                    as="div"
                    identity={`${idBase}/items/${i}/value`}
                    value={item.value ?? ""}
                    onSave={(v) => onItemChange(arrField, index, i, "value", v)}
                    className="text-4xl md:text-5xl font-bold text-accent mb-2"
                  />
                  <EditableSectionText
                    as="div"
                    identity={`${idBase}/items/${i}/label`}
                    value={item.label ?? ""}
                    onSave={(v) => onItemChange(arrField, index, i, "label", v)}
                    className="text-sm text-muted-foreground uppercase tracking-wide"
                  />
                </div>
              ))}
              {controls.canEdit && (
                <button
                  type="button"
                  onClick={controls.onAddItem}
                  className="min-h-[120px] rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add stat</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (section.type === "cta") {
    return (
      <>
        <SectionToolbar controls={controls} />
        <section className="py-16 md:py-20">
          <div className="container-max px-4">
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
              <EditableSectionText
                as="h2"
                identity={`${idBase}/title`}
                value={section.title ?? ""}
                rich
                onSave={(v) => onFieldChange(arrField, index, "title", v)}
                className="text-2xl md:text-3xl font-bold text-foreground mb-3 block"
              />
              <EditableSectionText
                as="p"
                identity={`${idBase}/desc`}
                value={section.desc ?? ""}
                multiline
                rich
                onSave={(v) => onFieldChange(arrField, index, "desc", v)}
                className="text-muted-foreground mb-6 max-w-xl mx-auto block"
              />
              <CtaButton ctaKey="feature_cta_talk_to_sales" size="lg" trackingPage="feature_page">
                <EditableText
                  page="features"
                  section="ui"
                  contentKey="cta_talk_to_sales"
                  fallback={isAr ? "تواصل معنا" : "Talk to sales"}
                />
              </CtaButton>
            </Card>
          </div>
        </section>
      </>
    );
  }

  if (section.type === "image_text") {
    return (
      <>
        <SectionToolbar controls={controls} />
        <section className="py-16 md:py-20">
          <div className="container-max px-4 grid md:grid-cols-2 gap-12 items-center">
            {section.image && (
              <div className={`relative group ${isRTL ? "md:order-2" : ""}`}>
                <img
                  src={section.image}
                  alt={section.title ?? ""}
                  className="w-full rounded-2xl shadow-lg"
                  loading="lazy"
                />
                {controls.canEdit && (
                  <>
                    <div className="absolute inset-0 pointer-events-none rounded-2xl outline-dashed outline-2 outline-offset-2 outline-accent/60 group-hover:outline-accent transition-colors" />
                    <button
                      type="button"
                      onClick={() => setImagePickerOpen(true)}
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground shadow-lg hover:bg-accent/90"
                    >
                      <Plus className="w-3 h-3" /> Change media
                    </button>
                  </>
                )}
                <MediaPicker
                  open={imagePickerOpen}
                  onOpenChange={setImagePickerOpen}
                  onSelect={(url) => onFieldChange(arrField, index, "image", url)}
                  uploadFolder={`feature-${feature.slug}`}
                  title="Choose section media"
                />
              </div>
            )}
            <div>
              <EditableSectionText
                as="h2"
                identity={`${idBase}/title`}
                value={section.title ?? ""}
                rich
                onSave={(v) => onFieldChange(arrField, index, "title", v)}
                className="text-3xl md:text-4xl font-bold text-foreground mb-4 block"
              />
              <EditableSectionText
                as="p"
                identity={`${idBase}/desc`}
                value={section.desc ?? ""}
                multiline
                rich
                onSave={(v) => onFieldChange(arrField, index, "desc", v)}
                className="text-lg text-muted-foreground leading-relaxed block"
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
};

const FeatureDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();
  const { enabled, canEdit } = useEditMode();
  const {
    feature,
    isLoading,
    saving,
    dirty,
    saveNow,
    updateField,
    updateSectionItem,
    updateSectionField,
    addSectionItem,
    removeSectionItem,
    addSection,
    insertSection,
    removeSection,
    moveSection,
    updateSection,
  } = useEditableFeature(slug);
  const [advancedSectionEditorOpen, setAdvancedSectionEditorOpen] = useState(false);
  const isAr = lang === "ar";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          <EditableText
            page="features"
            section="ui"
            contentKey="loading_label"
            fallback={isAr ? "جارٍ التحميل…" : "Loading…"}
          />
        </div>
      </Layout>
    );
  }

  if (!feature) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <EditableText
            as="h1"
            page="features"
            section="ui"
            contentKey="not_found_title"
            fallback={isAr ? "لم يتم العثور على الميزة" : "Feature not found"}
            className="text-3xl font-bold text-foreground mb-2 block"
          />
          <EditableText
            as="p"
            page="features"
            section="ui"
            contentKey="not_found_desc"
            multiline
            fallback={
              isAr
                ? "لم نتمكن من العثور على صفحة الميزة هذه. ربما تم إلغاء نشرها."
                : "We couldn't find that feature page. It may have been unpublished."
            }
            className="text-muted-foreground mb-6 block"
          />
          <CtaButton ctaKey="feature_not_found_browse">
            <EditableText
              page="features"
              section="ui"
              contentKey="browse_all_label"
              fallback={isAr ? "تصفح جميع الميزات" : "Browse all features"}
            />
          </CtaButton>
        </div>
      </Layout>
    );
  }

  const badge = (isAr && feature.hero_badge_ar) || feature.hero_badge;
  const title = (isAr && feature.hero_title_ar) || feature.hero_title;
  const desc = (isAr && feature.hero_desc_ar) || feature.hero_desc;
  const ctaPrimaryLabel =
    (isAr && feature.cta_primary_label_ar) || feature.cta_primary_label;
  const ctaSecondaryLabel =
    (isAr && feature.cta_secondary_label_ar) || feature.cta_secondary_label;
  // When Arabic sections are empty, render EN as a visual fallback but still
  // write edits into `sections_ar` so localisation can be created inline.
  const arrField: "sections" | "sections_ar" = isAr ? "sections_ar" : "sections";
  const sections = ((isAr ? feature.sections_ar : feature.sections) as FeatureSection[] | undefined)?.length
    ? ((isAr ? feature.sections_ar : feature.sections) as FeatureSection[])
    : ((feature.sections as FeatureSection[]) ?? []);

  const seoTitle =
    (isAr && feature.seo_title_ar) ||
    feature.seo_title ||
    `${title} | Digitize me`;
  const seoDesc =
    (isAr && feature.seo_description_ar) || feature.seo_description || desc || "";

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        titleAr={feature.seo_title_ar ?? undefined}
        descriptionAr={feature.seo_description_ar ?? undefined}
        path={`/features/${feature.slug}`}
        pageKey={`features-${feature.slug}`}
      />

      {canEdit && (
        <div className="container-max px-4 mb-4">
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <Button type="button" size="sm" variant="outline" onClick={() => void saveNow()} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save now"}
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="container-max px-4 relative">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            <div className={`max-w-2xl ${isRTL ? "text-right" : "text-left"}`}>
              {(badge || enabled) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-5">
                  <Sparkles size={12} />
                  <EditableFeatureText
                    feature={feature}
                    field="hero_badge"
                    fallback={enabled ? (isAr ? "أضِف شارة" : "Add a badge") : ""}
                    onSave={(k, v) => updateField(k, v)}
                  />
                </div>
              )}
              <div className={`flex ${isRTL ? "justify-end" : "justify-start"} mb-6`}>
                {(feature.icon || canEdit) && (
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <EditableIcon
                      page={`feature-${feature.slug}`}
                      slotKey="hero_icon"
                      imgClassName="w-8 h-8 object-contain"
                      size={32}
                    >
                      <Icon name={feature.icon ?? "Sparkles"} className="w-8 h-8 text-accent" />
                    </EditableIcon>
                  </div>
                )}
              </div>
              <EditableFeatureText
                as="h1"
                feature={feature}
                field="hero_title"
                fallback={title}
                rich
                onSave={(k, v) => updateField(k, v)}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6 block"
              />
              {(desc || enabled) && (
                <EditableFeatureText
                  as="p"
                  feature={feature}
                  field="hero_desc"
                  multiline
                  rich
                  fallback={enabled ? (isAr ? "أضِف وصفًا…" : "Add a description…") : ""}
                  onSave={(k, v) => updateField(k, v)}
                  className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 block"
                />
              )}
              <div className={`flex flex-wrap items-center gap-3 ${isRTL ? "justify-end" : "justify-start"}`}>
                {(ctaPrimaryLabel || enabled) && (
                  <CtaButton
                    ctaKey={`feature_hero_primary_${feature.slug}`}
                    customLocation={`Feature page — ${feature.slug} hero primary`}
                    defaultStyle={{ variant: "primary", size: "lg" }}
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    defaultTo={feature.cta_primary_link || "/contact"}
                  >
                    <EditableFeatureText
                      feature={feature}
                      field="cta_primary_label"
                      fallback={enabled ? (isAr ? "زر أساسي" : "Primary CTA") : ""}
                      onSave={(k, v) => updateField(k, v)}
                    />
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </CtaButton>
                )}
                {(ctaSecondaryLabel || enabled) && (
                  <CtaButton
                    ctaKey={`feature_hero_secondary_${feature.slug}`}
                    customLocation={`Feature page — ${feature.slug} hero secondary`}
                    defaultStyle={{ variant: "outline", size: "lg" }}
                    size="lg"
                    variant="outline"
                    defaultTo={feature.cta_secondary_link || "/pricing"}
                  >
                    <EditableFeatureText
                      feature={feature}
                      field="cta_secondary_label"
                      fallback={enabled ? (isAr ? "زر ثانوي" : "Secondary CTA") : ""}
                      onSave={(k, v) => updateField(k, v)}
                    />
                  </CtaButton>
                )}
              </div>
              {enabled && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Tip: change CTA links, sections, and SEO from the admin → "Open in admin" below.
                </p>
              )}
            </div>

            <div className="order-first lg:order-last">
              <EditableImage
                page={`feature-${feature.slug}`}
                slotKey="hero_visual"
                alt={title}
                imgClassName="w-full h-auto rounded-2xl object-contain"
              >
                <AnimatedFeatureHero icon={feature.icon ?? undefined} />
              </EditableImage>
            </div>
          </div>
        </div>
      </section>

      {sections.map((s, i) => (
        <SectionRenderer
          key={`${arrField}-${i}`}
          feature={feature}
          arrField={arrField}
          section={s}
          index={i}
          isRTL={isRTL}
          isAr={isAr}
          controls={{
            canEdit,
            onAddItem: () => addSectionItem(arrField, i),
            addItemLabel:
              s.type === "stats"
                ? "Add stat"
                : s.type === "cta"
                  ? "Add CTA item"
                  : s.type === "image_text"
                    ? "Add content"
                    : "Add card",
            onRemoveItem: (itemIdx) => removeSectionItem(arrField, i, itemIdx),
            onRemoveSection: () => {
              if (window.confirm("Delete this entire section?")) removeSection(arrField, i);
            },
            onMoveSection: (dir) => moveSection(arrField, i, dir),
            onInsertSection: (position) =>
              insertSection(arrField, position === "above" ? i : i + 1, {
                type: "feature_list",
                title: "New section",
                items: [{ title: "Card 1", desc: "Describe this card…" }],
              }),
            onOpenAdvanced: () => setAdvancedSectionEditorOpen(true),
            isFirst: i === 0,
            isLast: i === sections.length - 1,
          }}
          onItemChange={updateSectionItem}
          onFieldChange={updateSectionField}
        />
      ))}

      {canEdit && (
        <section className="py-12">
          <div className="container-max px-4">
            <div className="rounded-xl border-2 border-dashed border-border p-6 bg-muted/20">
              <p className="text-sm font-semibold text-foreground mb-3">Add a new section</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addSection(arrField, {
                      type: "feature_list",
                      title: "New section",
                      items: [
                        { title: "Card 1", desc: "Describe this card…" },
                        { title: "Card 2", desc: "Describe this card…" },
                        { title: "Card 3", desc: "Describe this card…" },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-accent/30 bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20"
                >
                  <Plus className="w-4 h-4" /> Cards grid
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSection(arrField, {
                      type: "stats",
                      title: "Key numbers",
                      items: [
                        { value: "99%", label: "Accuracy" },
                        { value: "10x", label: "Faster" },
                        { value: "24/7", label: "Available" },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted"
                >
                  <Plus className="w-4 h-4" /> Stats
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSection(arrField, {
                      type: "image_text",
                      title: "Section title",
                      desc: "Describe this section…",
                      image: "",
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted"
                >
                  <Plus className="w-4 h-4" /> Image + text
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSection(arrField, {
                      type: "cta",
                      title: "Ready to get started?",
                      desc: "Talk to our team today.",
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted"
                >
                  <Plus className="w-4 h-4" /> CTA banner
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Sheet open={advancedSectionEditorOpen} onOpenChange={setAdvancedSectionEditorOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Advanced sections editor</SheetTitle>
            <SheetDescription>
              Add, reorder, and refine all blocks for this feature page.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SectionsEditor
              value={sections}
              onChange={(next) => updateField(arrField, next as FeatureRow[typeof arrField])}
              rtl={isRTL}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default FeatureDetail;
