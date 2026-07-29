import { motion } from "framer-motion";
import { MapPin, Building2, Globe2 } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import { useLanguage } from "@/i18n/LanguageContext";

const OFFICES = [
  {
    slot: "o1",
    Icon: Building2,
    cityEn: "Dubai, UAE",
    cityAr: "دبي، الإمارات",
    roleEn: "Headquarters",
    roleAr: "المقر الرئيسي",
    descEn: "Product, engineering and customer success — plus UAE-hosted infrastructure.",
    descAr: "المنتج والهندسة ونجاح العملاء — بالإضافة إلى بنية تحتية مستضافة في الإمارات.",
  },
  {
    slot: "o2",
    Icon: MapPin,
    cityEn: "Abu Dhabi, UAE",
    cityAr: "أبوظبي، الإمارات",
    roleEn: "Public sector team",
    roleAr: "فريق القطاع الحكومي",
    descEn: "On-site implementation and support for government and semi-government entities.",
    descAr: "التنفيذ والدعم الميداني للجهات الحكومية وشبه الحكومية.",
  },
  {
    slot: "o3",
    Icon: Globe2,
    cityEn: "GCC & wider region",
    cityAr: "الخليج والمنطقة",
    roleEn: "Partner network",
    roleAr: "شبكة الشركاء",
    descEn: "Certified partners delivering deployments across Saudi Arabia, Qatar, Kuwait and beyond.",
    descAr: "شركاء معتمدون ينفذون المشاريع في السعودية وقطر والكويت وغيرها.",
  },
];

const AboutOffices = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="max-w-3xl mb-12">
          <EditableText
            as="span"
            page="about"
            section="offices"
            contentKey="eyebrow"
            fallback={isRTL ? "مكاتبنا" : "Our offices"}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          />
          <EditableText
            as="h2"
            page="about"
            section="offices"
            contentKey="title"
            fallback={isRTL ? "حضور محلي. خبرة إقليمية." : "Local Presence. Regional Expertise."}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 block leading-tight"
            rich
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {OFFICES.map((o, i) => (
            <motion.div
              key={o.slot}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <o.Icon className="w-6 h-6 text-accent mb-4" />
              <EditableText
                as="h3"
                page="about"
                section="offices"
                contentKey={`${o.slot}_city`}
                fallback={isRTL ? o.cityAr : o.cityEn}
                className="text-xl font-bold text-foreground block"
              />
              <EditableText
                as="span"
                page="about"
                section="offices"
                contentKey={`${o.slot}_role`}
                fallback={isRTL ? o.roleAr : o.roleEn}
                className="text-sm font-semibold text-accent block mb-3"
              />
              <EditableText
                as="p"
                page="about"
                section="offices"
                contentKey={`${o.slot}_desc`}
                fallback={isRTL ? o.descAr : o.descEn}
                className="text-muted-foreground leading-relaxed"
                rich
                multiline
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutOffices;
