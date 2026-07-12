import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSubmitLead } from "@/hooks/useLeads";
import { useSiteContent } from "@/hooks/useSiteContent";

const USE_CASES = [
  { key: "ocr", labelEn: "OCR & document scanning", labelAr: "مسح ضوئي للمستندات" },
  { key: "automation", labelEn: "Workflow automation", labelAr: "أتمتة سير العمل" },
  { key: "archive", labelEn: "Digital archiving", labelAr: "أرشفة رقمية" },
  { key: "integration", labelEn: "ERP / CRM integration", labelAr: "تكامل ERP/CRM" },
  { key: "compliance", labelEn: "Compliance & audit", labelAr: "الامتثال والتدقيق" },
  { key: "other", labelEn: "Something else", labelAr: "غير ذلك" },
];

const INDUSTRIES = [
  { key: "law", labelEn: "Legal", labelAr: "قانوني" },
  { key: "finance", labelEn: "Banking & Finance", labelAr: "بنوك ومالية" },
  { key: "healthcare", labelEn: "Healthcare", labelAr: "رعاية صحية" },
  { key: "government", labelEn: "Government", labelAr: "حكومي" },
  { key: "logistics", labelEn: "Logistics", labelAr: "خدمات لوجستية" },
  { key: "construction", labelEn: "Construction", labelAr: "إنشاءات" },
  { key: "other", labelEn: "Other", labelAr: "أخرى" },
];

const SIZES = [
  { key: "1-10", labelEn: "1–10 employees", labelAr: "١-١٠ موظفين" },
  { key: "11-50", labelEn: "11–50 employees", labelAr: "١١-٥٠ موظفاً" },
  { key: "51-200", labelEn: "51–200 employees", labelAr: "٥١-٢٠٠ موظف" },
  { key: "201-1000", labelEn: "201–1,000 employees", labelAr: "٢٠١-١٠٠٠ موظف" },
  { key: "1000+", labelEn: "1,000+ employees", labelAr: "+١٠٠٠ موظف" },
];

const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(100),
  work_email: z.string().trim().email("Please enter a valid work email").max(255),
  company: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(1000).optional(),
});

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where this modal was opened from — stored on the lead for attribution. */
  source?: string;
}

const LeadCaptureModal = forwardRef<HTMLDivElement, LeadCaptureModalProps>(({ open, onOpenChange, source }, forwardedRef) => {
  const { isRTL, lang } = useLanguage();
  const { toast } = useToast();
  const submit = useSubmitLead();
  const { getContent } = useSiteContent("global", "lead_modal");
  const contentRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    work_email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useImperativeHandle(forwardedRef, () => contentRef.current, []);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setUseCase("");
      setIndustry("");
      setSize("");
      setForm({ full_name: "", work_email: "", company: "", phone: "", message: "" });
      setErrors({});
      setDone(false);
    }
  }, [open]);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      await submit.mutateAsync({
        full_name: parsed.data.full_name,
        work_email: parsed.data.work_email,
        company: parsed.data.company,
        phone: parsed.data.phone,
        message: parsed.data.message,
        use_case: useCase || undefined,
        industry: industry || undefined,
        company_size: size || undefined,
        cta_source: source,
      });
      setDone(true);
      toast({
        title: l("Thanks! We'll be in touch.", "شكراً! سنتواصل معك قريباً."),
        description: l("Our team typically responds within one business day.", "يرد فريقنا عادة خلال يوم عمل واحد."),
      });
      // Auto-close after 2.5s
      setTimeout(() => onOpenChange(false), 2500);
    } catch (err) {
      toast({
        title: l("Something went wrong", "حدث خطأ"),
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const heroTitle = getContent(
    "title",
    l("Tell us about your needs", "أخبرنا عن احتياجاتك"),
  );
  const heroDesc = getContent(
    "description",
    l(
      "Three quick questions and our team will reach out with a tailored walkthrough.",
      "ثلاثة أسئلة سريعة وسيتواصل معك فريقنا بعرض مخصص.",
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={contentRef} className="max-w-lg p-0 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="bg-gradient-to-br from-accent/10 via-background to-primary/5 px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{heroTitle}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {heroDesc}
            </DialogDescription>
          </DialogHeader>

          {/* Progress dots */}
          {!done && (
            <div className="flex items-center gap-1.5 mt-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 rounded-full flex-1 transition-colors ${
                    n <= step ? "bg-accent" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                  <Check className="text-accent" size={28} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {l("You're all set!", "تم الإرسال!")}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {l(
                    "We received your details and will be in touch shortly.",
                    "استلمنا بياناتك وسنتواصل معك قريباً.",
                  )}
                </p>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 16 : -16 }}
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  {l("What brings you here?", "ما الذي يهمك أكثر؟")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {USE_CASES.map((u) => (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => {
                        setUseCase(u.key);
                        next();
                      }}
                      className={`text-start text-sm p-3 rounded-lg border transition-all ${
                        useCase === u.key
                          ? "bg-accent/10 border-accent text-foreground"
                          : "bg-card border-border hover:border-accent/40 text-foreground/80"
                      }`}
                    >
                      {l(u.labelEn, u.labelAr)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 16 : -16 }}
                className="space-y-5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {l("Industry", "الصناعة")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((i) => (
                      <button
                        key={i.key}
                        type="button"
                        onClick={() => setIndustry(i.key)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          industry === i.key
                            ? "bg-accent/10 border-accent text-foreground"
                            : "bg-card border-border hover:border-accent/40 text-foreground/70"
                        }`}
                      >
                        {l(i.labelEn, i.labelAr)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {l("Company size", "حجم الشركة")}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          setSize(s.key);
                          next();
                        }}
                        className={`text-start text-sm p-2.5 rounded-lg border transition-all ${
                          size === s.key
                            ? "bg-accent/10 border-accent text-foreground"
                            : "bg-card border-border hover:border-accent/40 text-foreground/80"
                        }`}
                      >
                        {l(s.labelEn, s.labelAr)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 16 : -16 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    {l("Full name", "الاسم الكامل")} *
                  </label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    maxLength={100}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive mt-1">{errors.full_name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    {l("Work email", "البريد الإلكتروني للعمل")} *
                  </label>
                  <Input
                    type="email"
                    value={form.work_email}
                    onChange={(e) => setForm({ ...form, work_email: e.target.value })}
                    required
                    maxLength={255}
                    dir="ltr"
                  />
                  {errors.work_email && (
                    <p className="text-xs text-destructive mt-1">{errors.work_email}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/80 mb-1 block">
                      {l("Company", "الشركة")}
                    </label>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      maxLength={100}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/80 mb-1 block">
                      {l("Phone", "الهاتف")}
                    </label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      maxLength={40}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    {l("Anything else? (optional)", "أي شيء آخر؟ (اختياري)")}
                  </label>
                  <Textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={1000}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submit.isPending}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11"
                >
                  {submit.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      {l("Submit", "إرسال")}
                      <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {!done && step > 1 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/30">
            <Button type="button" variant="ghost" size="sm" onClick={back} className="text-muted-foreground">
              <ArrowLeft size={14} className={isRTL ? "ml-1.5 rotate-180" : "mr-1.5"} />
              {l("Back", "السابق")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {l(`Step ${step} of 3`, `الخطوة ${step} من ٣`)}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

LeadCaptureModal.displayName = "LeadCaptureModal";

export default LeadCaptureModal;
