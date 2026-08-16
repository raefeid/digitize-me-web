import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import StyleEditableButton from "@/components/cms/StyleEditableButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSubmitLead } from "@/hooks/useLeads";
import EditableText from "@/components/cms/EditableText";
import EditableIcon from "@/components/cms/EditableIcon";
import { useEditMode } from "@/components/cms/EditModeContext";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import UAEHostingBadge from "@/components/common/UAEHostingBadge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Contact = () => {
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("contact");
  const { enabled: editEnabled } = useEditMode();
  const createLead = useSubmitLead();
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", phone: "", industry: "", message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // --- Anti-spam ---
  // Honeypot: hidden field that real users never see/fill. Bots auto-fill all inputs,
  // so a non-empty value here means "almost certainly a bot" → silently drop the submit.
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Time the form was first mounted. Submissions faster than ~2s are almost
  // always automated (humans need time to read & type).
  const formMountedAt = useRef<number>(Date.now());
  // Client-side throttle. localStorage key holds the last successful submit ts.
  // Not a real defense (cleared on reset / new device) — just a friction layer.
  const SUBMIT_THROTTLE_MS = 60_000; // 60s between submissions
  const STORAGE_KEY = "contact_last_submit_at";

  // Bilingual zod schema. Re-built when language flips so messages match.
  // Rules: name 1-100 chars, valid email, message 10-1000 chars.
  const contactSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, isRTL ? "الاسم مطلوب" : "Name is required")
          .max(100, isRTL ? "الاسم طويل جدًا (الحد الأقصى 100 حرف)" : "Name is too long (max 100 characters)"),
        email: z
          .string()
          .trim()
          .min(1, isRTL ? "البريد الإلكتروني مطلوب" : "Email is required")
          .email(isRTL ? "يرجى إدخال بريد إلكتروني صالح" : "Please enter a valid email address"),
        message: z
          .string()
          .trim()
          .min(10, isRTL ? "الرسالة قصيرة جدًا (10 أحرف على الأقل)" : "Message is too short (min 10 characters)")
          .max(1000, isRTL ? "الرسالة طويلة جدًا (الحد الأقصى 1000 حرف)" : "Message is too long (max 1000 characters)"),
      }),
    [isRTL]
  );

  /** Validate a single field on blur — clears its error, or sets a fresh one. */
  const validateField = (field: "name" | "email" | "message") => {
    const fieldSchema = contactSchema.shape[field];
    const result = fieldSchema.safeParse(formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) Honeypot — if filled OR submitted suspiciously fast, silently no-op.
    //    We pretend success so bots don't learn what tripped them.
    const honeypotValue = honeypotRef.current?.value ?? "";
    const elapsed = Date.now() - formMountedAt.current;
    if (honeypotValue.trim() !== "" || elapsed < 2000) {
      toast.success(t("contact.toast.title"), { description: t("contact.toast.desc") });
      setFormData({ name: "", email: "", company: "", phone: "", industry: "", message: "" });
      setSubmitted(true);
      return;
    }

    // 2) Client-side throttle — block rapid resubmits from the same browser.
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
      const remaining = SUBMIT_THROTTLE_MS - (Date.now() - last);
      if (last && remaining > 0) {
        const seconds = Math.ceil(remaining / 1000);
        toast.error(isRTL ? "يرجى الانتظار" : "Please wait", {
          description: isRTL
            ? `يمكنك إرسال رسالة أخرى خلال ${seconds} ثانية.`
            : `You can send another message in ${seconds} second${seconds === 1 ? "" : "s"}.`,
        });
        return;
      }
    } catch {
      // localStorage may be disabled (private mode) — fail-open.
    }

    // Validate first — bail if anything fails and show inline errors.
    const result = contactSchema.safeParse({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "name" | "email" | "message";
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      // Focus the first invalid field for keyboard / screen-reader users.
      const firstBad = (["name", "email", "message"] as const).find((k) => fieldErrors[k]);
      if (firstBad) document.getElementById(`contact-${firstBad}`)?.focus();
      return;
    }
    setErrors({});

    try {
      await createLead.mutateAsync({
        full_name: formData.name,
        work_email: formData.email,
        company: formData.company,
        phone: formData.phone,
        industry: formData.industry,
        message: formData.message,
        cta_source: "contact_form",
      });
    } catch (error) {
      toast.error(isRTL ? "تعذر إرسال الرسالة" : "Could not send message", {
        description: isRTL
          ? "يرجى المحاولة مرة أخرى بعد قليل."
          : "Please try again in a moment.",
      });
      return;
    }

    // Stamp the throttle clock so the next submit waits SUBMIT_THROTTLE_MS.
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* noop */ }

    toast.success(t("contact.toast.title"), { description: t("contact.toast.desc") });
    setFormData({ name: "", email: "", company: "", phone: "", industry: "", message: "" });
    setSubmitted(true);
  };

  const industryOptions = [
    { value: "law", label: t("ind.law-firms") },
    { value: "accounting", label: t("ind.accounting") },
    { value: "logistics", label: t("ind.logistics") },
    { value: "real-estate", label: t("ind.real-estate") },
    { value: "healthcare", label: t("ind.healthcare") },
    { value: "education", label: t("ind.education") },
    { value: "manufacturing", label: t("ind.manufacturing") },
    { value: "construction", label: t("ind.construction") },
    { value: "government", label: t("ind.government") },
    { value: "banking", label: t("ind.banking-finance") },
    { value: "oil-gas", label: t("ind.oil-gas") },
    { value: "insurance", label: t("ind.insurance") },
    { value: "retail", label: t("ind.retail") },
    { value: "other", label: t("common.other") },
  ];

  return (
    <Layout>
      <RevealAutoScanner page="contact" />
      <SEOHead
        title={getContent("meta_title", "Contact Digitize me | Book an AI OCR Demo")}
        description={getContent("meta_description", "Contact Digitize me to book a demo, request pricing, or talk with our team about AI document management and Arabic OCR.")}
        titleAr="تواصل مع Digitize me | احجز عرض OCR بالذكاء الاصطناعي"
        descriptionAr="تواصل مع Digitize me لحجز عرض توضيحي أو طلب الأسعار أو التحدث مع فريقنا حول إدارة المستندات بالذكاء الاصطناعي وOCR العربي."
        path="/contact"
        pageKey="contact"
      />
      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className={isRTL ? "lg:order-2" : ""}>
              <EditableText page="contact" section="hero" contentKey="contact_badge" fallback={t("contact.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
              <EditableText as="h1" page="contact" section="hero" contentKey="contact_title" fallback={t("contact.title")} className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6 block" rich />
              <EditableText as="p" page="contact" section="hero" contentKey="contact_desc" fallback={t("contact.desc")} multiline className="text-lg text-muted-foreground mb-8" rich />

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <EditableIcon page="contact" slotKey="email_icon" size={20}>
                      <Mail size={20} className="text-accent" />
                    </EditableIcon>
                  </div>
                  <div>
                    <EditableText as="h3" page="contact" section="info" contentKey="email_label" fallback={t("contact.email")} className="font-semibold text-foreground text-sm block" />
                    <a href={`mailto:${getContent("contact_email", "info@digitizeme.ae")}`} dir="ltr" className="text-muted-foreground text-sm hover:text-accent transition-colors inline-block [unicode-bidi:isolate] rtl:text-right">
                      <EditableText page="contact" section="info" contentKey="contact_email" fallback="info@digitizeme.ae" />
                    </a>

                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <EditableIcon page="contact" slotKey="phone_icon" size={20}>
                      <Phone size={20} className="text-accent" />
                    </EditableIcon>
                  </div>
                  <div>
                    <EditableText as="h3" page="contact" section="info" contentKey="phone_label" fallback={t("contact.phone")} className="font-semibold text-foreground text-sm block" />
                    <p dir="ltr" className="text-muted-foreground text-sm [unicode-bidi:isolate] rtl:text-right">
                      <a href={`tel:${getContent("contact_phone1", "+97145808611")}`} className="hover:text-accent transition-colors">
                        <EditableText page="contact" section="info" contentKey="contact_phone1" fallback="+971 4 580 8611" />
                      </a>
                    </p>
                    <p dir="ltr" className="text-muted-foreground text-sm [unicode-bidi:isolate] rtl:text-right">
                      <a href={`tel:${getContent("contact_phone2", "+971565226587")}`} className="hover:text-accent transition-colors">
                        <EditableText page="contact" section="info" contentKey="contact_phone2" fallback="+971 56 522 6587" />
                      </a>
                    </p>

                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <EditableIcon page="contact" slotKey="address_icon" size={20}>
                      <MapPin size={20} className="text-accent" />
                    </EditableIcon>
                  </div>
                  <div>
                    <EditableText as="h3" page="contact" section="info" contentKey="address_label" fallback={t("contact.office")} className="font-semibold text-foreground text-sm block" />
                    <EditableText as="p" page="contact" section="info" contentKey="contact_address" fallback={isRTL ? "دبي، الإمارات العربية المتحدة" : "Dubai, United Arab Emirates"} multiline className="text-muted-foreground text-sm" />
                  </div>
                </div>
              </div>
              <div className="pt-6"><UAEHostingBadge /></div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className={isRTL ? "lg:order-1" : ""}>
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
                {/* Honeypot — invisible to humans, irresistible to bots. Filled value = silent drop. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                  <label htmlFor="contact-website">Website (leave blank)</label>
                  <input
                    ref={honeypotRef}
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-1.5 block">
                      <EditableText page="contact" section="form" contentKey="form_name_label" fallback={`${t("contact.form.name")} *`} />
                    </label>
                    <Input
                      id="contact-name"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      onBlur={() => validateField("name")}
                      placeholder={getContent("form_name_placeholder", isRTL ? "اسمك" : "Your name")}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                      maxLength={100}
                    />
                    {errors.name && (
                      <p id="contact-name-error" role="alert" className="mt-1 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden /> {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-1.5 block">
                      <EditableText page="contact" section="form" contentKey="form_email_label" fallback={`${t("contact.form.email")} *`} />
                    </label>
                    <Input
                      id="contact-email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      onBlur={() => validateField("email")}
                      placeholder={getContent("form_email_placeholder", isRTL ? "بريدك@الشركة.com" : "you@company.com")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.email && (
                      <p id="contact-email-error" role="alert" className="mt-1 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-company" className="text-sm font-medium text-foreground mb-1.5 block">
                      <EditableText page="contact" section="form" contentKey="form_company_label" fallback={t("contact.form.company")} />
                    </label>
                    <Input id="contact-company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder={getContent("form_company_placeholder", isRTL ? "اسم الشركة" : "Company name")} />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="text-sm font-medium text-foreground mb-1.5 block">
                      <EditableText page="contact" section="form" contentKey="form_phone_label" fallback={t("contact.form.phone")} />
                    </label>
                    <Input id="contact-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+971..." />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-industry" className="text-sm font-medium text-foreground mb-1.5 block">
                    <EditableText page="contact" section="form" contentKey="form_industry_label" fallback={t("contact.form.industry")} />
                  </label>
                  <select id="contact-industry" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })}>
                    <option value="">{getContent("form_industry_placeholder", t("contact.form.selectIndustry"))}</option>
                    {industryOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-1.5 block">
                    <EditableText page="contact" section="form" contentKey="form_message_label" fallback={`${t("contact.form.message")} *`} />
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
                    }}
                    onBlur={() => validateField("message")}
                    placeholder={getContent("form_message_placeholder", t("contact.form.messagePlaceholder"))}
                    rows={4}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "contact-message-error" : "contact-message-counter"}
                    className={errors.message ? "border-destructive focus-visible:ring-destructive" : ""}
                    maxLength={1000}
                  />
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {errors.message ? (
                      <p id="contact-message-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden /> {errors.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span id="contact-message-counter" dir="ltr" className={`text-[11px] tabular-nums [unicode-bidi:isolate] ${formData.message.length > 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                      {formData.message.length}/1000
                    </span>

                  </div>
                </div>
                <StyleEditableButton
                  styleKey="form_contact_submit"
                  location="Contact form — Send Message button"
                  type="submit"
                  className="w-full"
                  disabled={createLead.isPending}
                  defaultStyle={{ variant: "accent", size: "lg" }}
                >
                  <EditableText
                    page="contact"
                    section="form"
                    contentKey="form_submit_label"
                    fallback={createLead.isPending ? (isRTL ? "جارٍ الإرسال..." : "Sending...") : t("contact.form.submit")}
                  />
                  <Send size={16} className={isRTL ? "mr-2" : "ml-2"} />
                </StyleEditableButton>
                {submitted && (
                  <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground" role="status" aria-live="polite">
                    <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t("contact.toast.title")}</p>
                      <p className="text-muted-foreground">{t("contact.toast.desc")}</p>
                    </div>
                  </div>
                )}
                <EditableText as="p" page="contact" section="form" contentKey="form_note" fallback={t("contact.form.note")} multiline className="text-xs text-muted-foreground text-center" />
                {/* Admin-only: set the destination email or URL the form posts to */}
                {editEnabled && (
                  <div className="text-[11px] text-muted-foreground text-center border-t border-dashed border-accent/40 pt-2 mt-2 bg-accent/5 rounded p-2">
                    <div className="font-semibold text-accent mb-1">⚙ Form destination</div>
                    <EditableText
                      as="div"
                      page="contact"
                      section="form"
                      contentKey="form_submit_destination"
                      fallback="(click to set email address or POST URL)"
                      className="underline decoration-dotted block w-full px-2 py-1 rounded bg-background/60 hover:bg-background cursor-pointer min-h-[28px]"
                    />
                    <p className="mt-1 text-muted-foreground/70">
                      Email → opens user's mail client · URL (https://…) → POSTs JSON
                    </p>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <CustomBlocksRenderer page="contact" />
      <AddBlockButton page="contact" />
    </Layout>
  );
};

export default Contact;
