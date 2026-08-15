import { ShieldCheck, MapPin, Headphones } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import EditableIcon from "@/components/cms/EditableIcon";
import { useLanguage } from "@/i18n/LanguageContext";

const PILLARS = [
  {
    slot: "p1",
    Icon: ShieldCheck,
    titleEn: "UAE & KSA data residency",
    titleAr: "إقامة البيانات في الإمارات والسعودية",
    descEn:
      "Our SaaS infrastructure runs in UAE & KSA-hosted cloud regions. Your documents never leave the region unless you ask them to.",
    descAr:
      "تعمل بنيتنا التحتية على مناطق سحابية مستضافة في الإمارات والسعودية. لا تغادر مستنداتك المنطقة إلا إذا طلبت ذلك.",
  },
  {
    slot: "p2",
    Icon: MapPin,
    titleEn: "Built for the region",
    titleAr: "مصمّم للمنطقة",
    descEn:
      "Bilingual product, Arabic-first OCR, hijri dates, RTL layouts, and integrations with UAE & GCC government and banking systems.",
    descAr:
      "منتج ثنائي اللغة، تعرّف ضوئي يضع العربية أولًا، تواريخ هجرية، تخطيطات RTL، وتكاملات مع الجهات الحكومية والبنوك في الإمارات والخليج.",
  },
  {
    slot: "p3",
    Icon: Headphones,
    titleEn: "Local team & support",
    titleAr: "فريق ودعم محلي",
    descEn:
      "Account managers, onboarding specialists and 24×7 support based in the UAE — speaking your language, in your timezone.",
    descAr:
      "مديرو حسابات ومتخصصو تأهيل ودعم على مدار الساعة في الإمارات — يتحدثون لغتك وفي منطقتك الزمنية.",
  },
];

const UAETrustBlock = () => {
  const { isRTL } = useLanguage();
  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="max-w-3xl mb-12 text-center mx-auto">
          <EditableText
            as="span"
            page="about"
            section="uae"
            contentKey="eyebrow"
            fallback={isRTL ? "🇦🇪🇸🇦 مستضاف في الإمارات والسعودية" : "🇦🇪🇸🇦 Hosted in the UAE & KSA"}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          />
          <EditableText
            as="h2"
            page="about"
            section="uae"
            contentKey="title"
            fallback={isRTL ? "بُني في الإمارات. مصنوع للمنطقة." : "Built in the UAE. Made for the region."}
            className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 block"
            rich
          />
          <EditableText
            as="p"
            page="about"
            section="uae"
            contentKey="desc"
            fallback={
              isRTL
                ? "نحن في الإمارات — البنية التحتية، والفريق، والخبرة المحلية، كلها في مكان واحد."
                : "We're rooted in the UAE — infrastructure, team and local expertise, all in one place."
            }
            className="text-lg text-muted-foreground"
            rich
            multiline
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.slot}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <EditableIcon page="about" slotKey={`uae_${p.slot}_icon`} size={22}>
                  <p.Icon size={22} className="text-accent" />
                </EditableIcon>
              </div>
              <EditableText
                as="h3"
                page="about"
                section="uae"
                contentKey={`${p.slot}_title`}
                fallback={isRTL ? p.titleAr : p.titleEn}
                className="text-lg font-bold text-foreground mb-2 block"
              />
              <EditableText
                as="p"
                page="about"
                section="uae"
                contentKey={`${p.slot}_desc`}
                fallback={isRTL ? p.descAr : p.descEn}
                className="text-muted-foreground text-sm leading-relaxed"
                rich
                multiline
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UAETrustBlock;
