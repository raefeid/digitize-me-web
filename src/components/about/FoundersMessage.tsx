import { Quote } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import EditableImage from "@/components/cms/EditableImage";
import { useLanguage } from "@/i18n/LanguageContext";
// Locally bundled, optimized portrait (real Vite asset → URL string).
import raefEidPortrait from "@/assets/raef-eid-portrait.jpg";


const FoundersMessage = () => {
  const { isRTL } = useLanguage();
  return (
    <section className="section-padding bg-gradient-to-b from-background to-dm-navy-light">
      <div className="container-max">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
          <div className="flex flex-col items-center lg:items-start">
          <EditableImage
              page="about"
              slotKey="founder_portrait"
              alt="Raef Eid"
              className="w-48 md:w-60 rounded-2xl overflow-hidden bg-muted border border-border shadow-lg"
              imgClassName="w-full h-auto object-contain"
            >
            <img
              src={raefEidPortrait}
              alt="Raef Eid"
              className="w-48 md:w-60 h-auto rounded-2xl border border-border shadow-lg"
              loading="lazy"
            />
            </EditableImage>
            <EditableText
              as="h3"
              page="about"
              section="founder"
              contentKey="name"
              fallback="Raef Eid"
              className="text-xl font-bold text-foreground mt-5 block"
            />
            <EditableText
              as="p"
              page="about"
              section="founder"
              contentKey="title"
              fallback={isRTL ? "المؤسس والرئيس التنفيذي" : "Founder & CEO"}
              className="text-sm text-accent font-medium"
            />
          </div>

          <div>
            <EditableText
              as="span"
              page="about"
              section="founder"
              contentKey="eyebrow"
              fallback={isRTL ? "رسالة المؤسس" : "Founder's message"}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              as="h2"
              page="about"
              section="founder"
              contentKey="heading"
              fallback={
                isRTL
                  ? "ثلاثة عقود من التعلّم. منصة واحدة."
                  : "Three Decades of Learning. One Platform."
              }
              className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6 block"
              rich
            />
            <Quote size={36} className="text-accent/30 mb-3" aria-hidden />
            <EditableText
              as="div"
              page="about"
              section="founder"
              contentKey="message"
              fallback={
                isRTL
                  ? "على مدى أكثر من ثلاثة عقود، عملنا مع جهات حكومية ومؤسسات وقطاعات خاضعة للتنظيم في المنطقة. التحدي الحقيقي لم يكن الورق يومًا، بل تشتّت المعلومات: سجلات موزّعة بين أنظمة وفرق ومواقع، ومتطلبات امتثال لا تحتمل التأخير. Digitize me هي خلاصة تلك الخبرة — منصة تجمع المعلومات في مكان واحد، وتدعم التميّز التشغيلي، وتحترم متطلبات الامتثال وإقامة البيانات في المنطقة. شكرًا لثقتكم — ما زالت أفضل فصولنا قادمة."
                  : "For more than three decades we have worked alongside governments, enterprises and regulated industries across the region. The real challenge was never paper — it was fragmented information: records scattered across systems, teams and locations, with compliance obligations that leave no room for delay. Digitize me is the distillation of that experience: one platform that brings information together, supports operational excellence, and respects the compliance and data residency requirements of this region. Thank you for trusting us — our best chapters are still ahead."
              }
              className="text-lg text-muted-foreground leading-relaxed"
              rich
              multiline
            />
            <EditableText
              as="p"
              page="about"
              section="founder"
              contentKey="signature"
              fallback="— Raef Eid"
              className="mt-6 text-foreground font-semibold italic"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundersMessage;
