import { Quote } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import EditableImage from "@/components/cms/EditableImage";
import { useLanguage } from "@/i18n/LanguageContext";
import raefEidPortrait from "@/assets/raef-eid-portrait.jpg.asset.json";


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
              className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-muted border border-border shadow-lg"
              imgClassName="w-full h-full object-cover"
            >
            <img
              src={raefEidPortrait.url}
              alt="Raef Eid"
              className="w-full h-full object-cover"
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
                  ? "لأكثر من ثلاثة عقود، رأينا مؤسسات المنطقة وهي تكافح مع جبال من الورق وأنظمة لا تتحدث العربية بطلاقة. Digitize me هو حصيلة كل ما تعلمناه: منصة ذكاء اصطناعي مبنية في الإمارات، تفهم لغتنا، وتحترم بياناتنا، وتُسرّع أعمالنا. شكرًا لثقتكم — ما زالت أفضل فصولنا قادمة."
                  : "For more than three decades we've watched organizations across the region wrestle with paper mountains and systems that don't speak Arabic fluently. Digitize me is everything we've learned, distilled into one platform: AI built in the UAE, fluent in our language, respectful of our data, and obsessive about speed. Thank you for trusting us — our best chapters are still ahead."
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
