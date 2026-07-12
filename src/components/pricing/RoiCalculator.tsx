import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/i18n/LanguageContext";
import { Region, useGeo } from "@/hooks/useGeoLocation";
import EditableText from "@/components/cms/EditableText";
import LeadCaptureCTA from "@/components/conversion/LeadCaptureCTA";

const regionCurrencyMeta: Record<Region, { code: string; symbol: string; symbolEn?: string }> = {
  EG: { code: "EGP", symbol: "ج.م", symbolEn: "EGP" },
  AE: { code: "AED", symbol: "د.إ", symbolEn: "AED" },
  SA: { code: "SAR", symbol: "ر.س", symbolEn: "SAR" },
  DEFAULT: { code: "USD", symbol: "$" },
};

/**
 * Simple, opinionated ROI calculator.
 * Inputs: # of employees handling docs, avg docs/day, avg minutes saved per doc.
 * Output: monthly hours saved + monthly $ saved (using region currency rough rates).
 */
const RoiCalculator = ({ activeRegion }: { activeRegion?: Region }) => {
  const { isRTL, lang } = useLanguage();
  const { region } = useGeo();
  const geoRegion = activeRegion ?? region;
  const currencyMeta = regionCurrencyMeta[geoRegion];
  const currency = currencyMeta.code;
  const currencySymbol = !isRTL && currencyMeta.symbolEn ? `${currencyMeta.symbolEn} ` : currencyMeta.symbol;

  const [employees, setEmployees] = useState(10);
  const [docsPerDay, setDocsPerDay] = useState(20);
  const [minutesPerDoc, setMinutesPerDoc] = useState(8);

  // Approx hourly cost by currency (intentionally simple — admins can refine later)
  const hourlyCost = useMemo(() => {
    const map: Record<Region, number> = {
      AE: 80,
      SA: 75,
      EG: 150,
      DEFAULT: 25,
    };
    return map[geoRegion] ?? 25;
  }, [geoRegion]);

  const result = useMemo(() => {
    const workingDays = 22;
    const minutesSavedMonth = employees * docsPerDay * minutesPerDoc * workingDays;
    const hoursSavedMonth = minutesSavedMonth / 60;
    const moneySavedMonth = hoursSavedMonth * hourlyCost;
    const moneySavedYear = moneySavedMonth * 12;
    return {
      hoursSavedMonth: Math.round(hoursSavedMonth),
      moneySavedMonth: Math.round(moneySavedMonth),
      moneySavedYear: Math.round(moneySavedYear),
    };
  }, [employees, docsPerDay, minutesPerDoc, hourlyCost]);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(lang === "ar" ? "ar-AE" : "en-US").format(n);
    } catch {
      return String(n);
    }
  };
  const formatMoney = (amount: number) => {
    const formatted = fmt(amount);
    if (currencyMeta.symbol === "$") return `${currencySymbol}${formatted}`;
    return !isRTL && currencyMeta.symbolEn ? `${currencySymbol}${formatted}` : `${formatted} ${currencySymbol}`;
  };

  return (
    <section className="section-padding bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="container-max">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator size={14} />
            <EditableText
              page="pricing"
              section="roi"
              contentKey="badge"
              fallback={l("ROI Calculator", "حاسبة العائد")}
            />
          </span>
          <EditableText
            as="h2"
            page="pricing"
            section="roi"
            contentKey="title"
            fallback={l(
              "See how much time & money you save",
              "احسب الوقت والمال الذي ستوفره",
            )}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3 block"
            rich
          />
          <EditableText
            as="p"
            page="pricing"
            section="roi"
            contentKey="description"
            fallback={l(
              "Drag the sliders to match your team size and document volume.",
              "اسحب الأشرطة لتتناسب مع حجم فريقك وعدد المستندات.",
            )}
            multiline
            className="text-muted-foreground"
            rich
          />
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-7">
            <SliderRow
              label={l("Employees handling documents", "عدد الموظفين الذين يتعاملون مع المستندات")}
              value={employees}
              min={1}
              max={500}
              step={1}
              onChange={setEmployees}
              suffix={l("people", "شخص")}
              isRTL={isRTL}
            />
            <SliderRow
              label={l("Documents per person, per day", "عدد المستندات لكل شخص يومياً")}
              value={docsPerDay}
              min={1}
              max={200}
              step={1}
              onChange={setDocsPerDay}
              suffix={l("docs/day", "مستند/يوم")}
              isRTL={isRTL}
            />
            <SliderRow
              label={l("Minutes saved per document", "الدقائق الموفرة لكل مستند")}
              value={minutesPerDoc}
              min={1}
              max={30}
              step={1}
              onChange={setMinutesPerDoc}
              suffix={l("min", "دقيقة")}
              isRTL={isRTL}
            />
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              {l(
                `Estimates use an average labor rate of ${formatMoney(hourlyCost)}/hour for ${currency}.`,
                `التقديرات تستخدم متوسط أجر ${formatMoney(hourlyCost)}/ساعة للعملة ${currency}.`,
              )}
            </p>
          </div>

          {/* Output */}
          <motion.div
            key={`${result.moneySavedMonth}-${result.hoursSavedMonth}`}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-2 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-5">
              <ResultRow
                icon={Clock}
                label={l("Hours saved / month", "الساعات الموفرة شهرياً")}
                value={fmt(result.hoursSavedMonth)}
                suffix={l("hrs", "ساعة")}
              />
              <ResultRow
                icon={DollarSign}
                label={l("Saved / month", "موفر شهرياً")}
                value={formatMoney(result.moneySavedMonth)}
                large
              />
              <ResultRow
                icon={TrendingUp}
                label={l("Saved / year", "موفر سنوياً")}
                value={formatMoney(result.moneySavedYear)}
              />
            </div>
            <LeadCaptureCTA
              source="roi_calculator"
              className="mt-6 w-full bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 border border-accent-foreground/30"
            >
              <EditableText
                page="pricing"
                section="roi"
                contentKey="roi_cta_label"
                as="span"
                fallback={l("Talk to our team", "تحدث مع فريقنا")}
              />
            </LeadCaptureCTA>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SliderRow = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  isRTL,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  suffix: string;
  isRTL: boolean;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <span className="text-sm font-bold text-accent" dir={isRTL ? "rtl" : "ltr"}>
        {value} <span className="text-muted-foreground font-normal text-xs">{suffix}</span>
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
      dir={isRTL ? "rtl" : "ltr"}
    />
  </div>
);

const ResultRow = ({
  icon: Icon,
  label,
  value,
  suffix,
  large,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  large?: boolean;
}) => (
  <div>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80 mb-1">
      <Icon size={14} />
      <span>{label}</span>
    </div>
    <div className={`font-extrabold tabular-nums ${large ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
      {value} {suffix && <span className="text-base font-semibold opacity-80">{suffix}</span>}
    </div>
  </div>
);

export default RoiCalculator;
