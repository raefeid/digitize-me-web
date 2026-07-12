import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFeatures } from "@/hooks/useFeatures";
import LeadCaptureCTA from "@/components/conversion/LeadCaptureCTA";
import EditableText from "@/components/cms/EditableText";
import CtaButton from "@/components/cms/CtaButton";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEditMode } from "@/components/cms/EditModeContext";
import SortableGrid from "@/components/cms/SortableGrid";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { useReorder, buildSortPayload } from "@/hooks/useReorder";
import { cn } from "@/lib/utils";

const Icon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) return null;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
};

const Features = () => {
  const { lang, isRTL } = useLanguage();
  const isAr = lang === "ar";
  const { data: features, isLoading } = useFeatures();
  const { getContent: getCta } = useSiteContent("features", "cta");
  const { enabled: editMode } = useEditMode();
  const reorder = useReorder({ table: "features" });

  const published = (features ?? []).filter((f) => f.published);

  return (
    <Layout>
      <SEOHead
        title="Platform Features — OCR, Automation, AI Classification & Security | Digitize me"
        description="Explore every feature of Digitize me: AI OCR for Arabic & English, workflow automation, document classification, and enterprise security."
        titleAr="ميزات المنصة — OCR، أتمتة، تصنيف بالذكاء الاصطناعي وأمان | Digitize me"
        descriptionAr="استكشف ميزات Digitize me: OCR للعربية والإنجليزية، أتمتة سير العمل، تصنيف المستندات، وأمان المؤسسات."
        path="/features"
        pageKey="features"
      />

      {/* Hero — fully editable via in-place visual editor */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="container-max px-4 relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-5">
            <Sparkles size={12} />
            <EditableText
              page="features"
              section="hero"
              contentKey="badge"
              fallback={isAr ? "ميزات المنصة" : "Platform Features"}
            />
          </div>
          <EditableText
            page="features"
            section="hero"
            contentKey="title"
            as="h1"
            fallback={isAr ? "كل ما تحتاجه لرقمنة مستنداتك" : "Everything you need to go digital"}
            className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-5"
          />
          <EditableText
            page="features"
            section="hero"
            contentKey="subtitle"
            as="p"
            multiline
            fallback={
              isAr
                ? "ميزات قوية مصممة للمؤسسات الحديثة. اكتشف كيف نساعدك على معالجة المستندات بسرعة ودقة وأمان."
                : "Powerful capabilities built for modern enterprises. Discover how we help you process documents faster, smarter, and more securely."
            }
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
          />
        </div>
      </section>

      {/* Grid — cards come from the editable features table (Admin → Feature pages) */}
      <section className="pb-16 md:pb-24">
        <div className="container-max px-4">
          {isLoading ? (
            <EditableText
              as="p"
              page="features"
              section="ui"
              contentKey="loading_label"
              fallback={isAr ? "جارٍ التحميل…" : "Loading…"}
              className="text-center text-muted-foreground text-sm py-12 block"
            />
          ) : published.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground text-sm">
              <EditableText
                page="features"
                section="ui"
                contentKey="empty_label"
                multiline
                fallback={
                  isAr
                    ? "لا توجد ميزات بعد. أضف واحدة من لوحة الإدارة ← صفحات الميزات."
                    : "No feature pages yet. Add one from Admin → Feature pages."
                }
              />
            </Card>
          ) : (
            <SortableGrid
              items={published}
              editMode={editMode}
              onReorder={(next) => reorder.mutate(buildSortPayload(next))}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              renderItem={(f, dragHandle) => {
                const title = (isAr && f.hero_title_ar) || f.hero_title;
                const desc = (isAr && f.hero_desc_ar) || f.hero_desc;
                const badge = (isAr && f.hero_badge_ar) || f.hero_badge;
                return (
                  <Link to={`/features/${f.slug}`} className="group block h-full">
                    <Card className="p-6 h-full hover:shadow-xl hover:border-accent/40 transition-all flex flex-col relative">
                      {dragHandle}
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                        <Icon name={f.icon} className="w-6 h-6 text-accent" />
                      </div>
                      {badge && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1.5">
                          {badge}
                        </p>
                      )}
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {title}
                      </h3>
                      {desc && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                          {desc}
                        </p>
                      )}
                      <div
                        className={cn(
                          "mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        <EditableText
                          page="features"
                          section="ui"
                          contentKey="learn_more_label"
                          fallback={isAr ? "اعرف أكثر" : "Learn more"}
                        />
                        <ArrowRight
                          className={cn(
                            "w-4 h-4 transition-transform group-hover:translate-x-1",
                            isRTL && "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0",
                          )}
                        />
                      </div>
                    </Card>
                  </Link>
                );
              }}
            />
          )}
        </div>
      </section>

      {/* Closing CTA — fully editable text + buttons (Admin → Buttons & links to change targets) */}
      <section className="pb-20">
        <div className="container-max px-4">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
            <EditableText
              page="features"
              section="cta"
              contentKey="title"
              as="h2"
              fallback={isAr ? "جاهز للبدء؟" : "Ready to see it in action?"}
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            />
            <EditableText
              page="features"
              section="cta"
              contentKey="subtitle"
              as="p"
              multiline
              fallback={
                isAr
                  ? "احجز عرضاً مخصصاً لمؤسستك وشاهد كيف نحوّل عملياتك المستندية."
                  : "Book a personalized demo and see how we transform your document operations."
              }
              className="text-muted-foreground mb-6 max-w-xl mx-auto"
            />
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-3",
                isRTL && "flex-row-reverse",
              )}
            >
              <LeadCaptureCTA source="features_index" size="lg">
                <EditableText
                  page="features"
                  section="cta"
                  contentKey="btn_primary"
                  as="span"
                  fallback={isAr ? "تواصل مع المبيعات" : "Talk to sales"}
                />
              </LeadCaptureCTA>
              <CtaButton ctaKey="features_index_secondary" variant="outline" size="lg">
                <EditableText
                  page="features"
                  section="cta"
                  contentKey="btn_secondary"
                  as="span"
                  fallback={isAr ? "عرض الأسعار" : "See pricing"}
                />
              </CtaButton>
            </div>
          </Card>
        </div>
      </section>

      <CustomBlocksRenderer page="features" />
      <AddBlockButton page="features" />
    </Layout>
  );
};

export default Features;
