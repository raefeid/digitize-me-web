import { useState } from "react";
import { motion } from "framer-motion";
import {
  Handshake,
  TrendingUp,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Headphones,
  Building2,
  Cpu,
  Globe2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitLead } from "@/hooks/useLeads";
import { useLanguage } from "@/i18n/LanguageContext";
import partnersHero from "@/assets/partners/partners-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const Partners = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const submitLead = useSubmitLead();
  const [form, setForm] = useState({
    full_name: "",
    work_email: "",
    company: "",
    phone: "",
    country: "",
    message: "",
  });

  const T = (en: string, ar: string) => (isRTL ? ar : en);

  const benefits = [
    {
      icon: TrendingUp,
      title: T("Recurring revenue", "إيرادات متكرّرة"),
      desc: T(
        "Attractive margins on every subscription, renewed year after year — plus uncapped services revenue on implementation.",
        "هوامش ربح جذابة على كل اشتراك تتجدّد سنويًا، بالإضافة إلى إيرادات خدمات غير محدودة على التنفيذ.",
      ),
    },
    {
      icon: GraduationCap,
      title: T("Free enablement & certification", "تمكين وشهادات مجانية"),
      desc: T(
        "Sales and technical certification tracks, demo environments and a partner sandbox — at no cost to your team.",
        "مسارات تدريب وشهادات للمبيعات والتقنيين وبيئات عرض وصندوق اختبار للشركاء — دون أي تكلفة على فريقك.",
      ),
    },
    {
      icon: Megaphone,
      title: T("Co-marketing & lead sharing", "تسويق مشترك ومشاركة العملاء"),
      desc: T(
        "Joint campaigns, event support, branded collateral and qualified inbound leads routed to you in your territory.",
        "حملات مشتركة ودعم للفعاليات ومواد تسويقية باسمك وعملاء محتملون مؤهّلون في منطقتك.",
      ),
    },
    {
      icon: Headphones,
      title: T("Dedicated partner manager", "مدير شركاء مخصّص"),
      desc: T(
        "A named contact plus pre-sales engineering support on live deals — we join your calls when it matters.",
        "جهة اتصال مخصّصة ودعم هندسي قبل البيع في الصفقات الحقيقية — ننضم إلى اجتماعاتك عند الحاجة.",
      ),
    },
    {
      icon: ShieldCheck,
      title: T("Deal registration & protection", "تسجيل الصفقات وحمايتها"),
      desc: T(
        "Register an opportunity and it's yours. Clear rules, no channel conflict, no surprises.",
        "سجّل الفرصة لتصبح لك. قواعد واضحة، دون تعارض في القنوات ودون مفاجآت.",
      ),
    },
    {
      icon: Globe2,
      title: T("UAE & KSA hosted platform", "منصة مستضافة في الإمارات والسعودية"),
      desc: T(
        "Sell with confidence into regulated sectors — data residency, Arabic-first OCR and 30+ years of regional delivery behind you.",
        "بِع بثقة في القطاعات المنظّمة — إقامة البيانات وOCR عربي أولًا وأكثر من ٣٠ عامًا من الخبرة الإقليمية.",
      ),
    },
  ];

  const tracks = [
    {
      icon: Handshake,
      name: T("Reseller Partner", "شريك إعادة بيع"),
      desc: T(
        "Resell Digitize me under your own commercial agreement with tiered margins and full sales enablement.",
        "أعد بيع Digitize me باتفاقك التجاري الخاص مع هوامش متدرجة وتمكين كامل للمبيعات.",
      ),
      points: [
        T("Tiered discount structure", "هيكل خصومات متدرج"),
        T("Deal registration", "تسجيل الصفقات"),
        T("Co-branded materials", "مواد بعلامة مشتركة"),
      ],
    },
    {
      icon: Cpu,
      name: T("Technology Partner", "شريك تقني"),
      desc: T(
        "Integrate your ERP, CRM or line-of-business platform with our document intelligence APIs.",
        "اربط نظام ERP أو CRM أو منصتك التشغيلية بواجهات ذكاء المستندات لدينا.",
      ),
      points: [
        T("API & webhook access", "الوصول إلى API والويب هوك"),
        T("Joint solution briefs", "أوراق حلول مشتركة"),
        T("Marketplace listing", "إدراج في المتجر"),
      ],
    },
    {
      icon: Building2,
      name: T("Implementation Partner", "شريك تنفيذ"),
      desc: T(
        "Deliver scanning, migration and change-management services around the platform and keep 100% of services revenue.",
        "قدّم خدمات المسح والترحيل وإدارة التغيير حول المنصة واحتفظ بكامل إيرادات الخدمات.",
      ),
      points: [
        T("Certified engineers", "مهندسون معتمدون"),
        T("Migration toolkit", "أدوات الترحيل"),
        T("Priority support SLA", "اتفاقية دعم ذات أولوية"),
      ],
    },
    {
      icon: Users,
      name: T("Referral Partner", "شريك إحالة"),
      desc: T(
        "Introduce us to an opportunity, we do the rest — and you get paid on every closed deal.",
        "عرّفنا على الفرصة ونتولى الباقي — وتحصل على عمولة عن كل صفقة مغلقة.",
      ),
      points: [
        T("No technical commitment", "دون التزام تقني"),
        T("Commission on signature", "عمولة عند التوقيع"),
        T("Simple online form", "نموذج بسيط عبر الإنترنت"),
      ],
    },
  ];

  const steps = [
    {
      n: "01",
      title: T("Apply", "قدّم طلبك"),
      desc: T("Send the short form below. We reply within 2 business days.", "أرسل النموذج القصير أدناه. نرد خلال يومي عمل."),
    },
    {
      n: "02",
      title: T("Discovery call", "مكالمة تعارف"),
      desc: T("30 minutes to align on territory, target sectors and commercials.", "٣٠ دقيقة للاتفاق على المنطقة والقطاعات المستهدفة والشروط التجارية."),
    },
    {
      n: "03",
      title: T("Enablement", "التمكين"),
      desc: T("Certification, demo tenant and your first co-selling plan.", "الشهادات وبيئة العرض وأول خطة بيع مشترك."),
    },
    {
      n: "04",
      title: T("Go to market", "الانطلاق للسوق"),
      desc: T("Joint pipeline reviews, shared leads and quarterly growth targets.", "مراجعات مشتركة للفرص وعملاء مشتركون وأهداف نمو ربع سنوية."),
    },
  ];

  const scrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.work_email.trim()) return;
    try {
      await submitLead.mutateAsync({
        full_name: form.full_name,
        work_email: form.work_email,
        company: form.company,
        phone: form.phone,
        use_case: "partner_program",
        message: [form.country && `Country/territory: ${form.country}`, form.message].filter(Boolean).join("\n"),
        cta_source: "partners_application",
      });
      toast({
        title: T("Application received", "تم استلام الطلب"),
        description: T(
          "Our partner team will get back to you within 2 business days.",
          "سيتواصل معك فريق الشركاء خلال يومي عمل.",
        ),
      });
      setForm({ full_name: "", work_email: "", company: "", phone: "", country: "", message: "" });
    } catch {
      toast({
        title: T("Something went wrong", "حدث خطأ ما"),
        description: T("Please try again or email partners@digitizeme.ae", "يرجى المحاولة مجددًا أو مراسلتنا على partners@digitizeme.ae"),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <SEOHead
        title={T(
          "Partner Program | Become a Digitize me Partner in the UAE & GCC",
          "برنامج الشركاء | كن شريكًا لـ Digitize me",
        )}
        description={T(
          "We're actively recruiting resellers, technology and implementation partners across the UAE, KSA and wider GCC. Recurring margins, free certification, co-marketing and dedicated support.",
          "نبحث بنشاط عن شركاء إعادة بيع وشركاء تقنيين ومنفذين في الإمارات والسعودية والخليج. هوامش متكررة وشهادات مجانية وتسويق مشترك ودعم مخصص.",
        )}
        path="/partners"
        pageKey="partners"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={partnersHero}
          alt={T("Two business partners shaking hands in a modern office at dusk", "شريكان يتصافحان في مكتب حديث عند الغروب")}
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={1104}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="container-max section-padding relative">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {T("Actively recruiting partners", "نبحث بنشاط عن شركاء")}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
              {T("Grow with the region's", "انمُ مع منصة")}{" "}
              <span className="text-accent">{T("document intelligence platform", "ذكاء المستندات الأولى في المنطقة")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              {T(
                "We're opening the Digitize me partner network across the UAE, KSA and the wider GCC. Bring the relationships — we bring the platform, the enablement and the margins.",
                "نفتح شبكة شركاء Digitize me في الإمارات والسعودية والخليج. أنت تجلب العلاقات، ونحن نوفّر المنصة والتمكين والهوامش.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#apply" onClick={(e) => scrollToId(e, "apply")}>
                  {T("Become a partner", "كن شريكًا")}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#benefits" onClick={(e) => scrollToId(e, "benefits")}>
                  {T("See the benefits", "اطّلع على المزايا")}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Benefits */}
      <section id="benefits" className="section-padding scroll-mt-24">
        <div className="container-max">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              {T("Why partner with us", "لماذا الشراكة معنا")}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              {T("Everything you need to sell, deliver and scale", "كل ما تحتاجه للبيع والتنفيذ والتوسّع")}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner tracks */}
      <section className="section-padding bg-card/40">
        <div className="container-max">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              {T("Partner tracks", "مسارات الشراكة")}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              {T("Four ways to work with Digitize me", "أربع طرق للعمل مع Digitize me")}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {tracks.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
                <div className="relative">
                  <t.icon className="h-7 w-7 text-accent" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{t.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {t.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding">
        <div className="container-max">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              {T("How it works", "كيف تسير العملية")}
            </span>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              {T("From first call to first deal in 30 days", "من أول مكالمة إلى أول صفقة خلال ٣٠ يومًا")}
            </h2>
          </div>
          <div className="relative mt-12 grid gap-6 md:grid-cols-4">
            <div className="absolute inset-x-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent md:block" />
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application */}
      <section id="apply" className="section-padding scroll-mt-24 bg-primary text-primary-foreground">
        <div className="container-max grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              {T("Let's build the region's digital backbone together", "لنبنِ معًا العمود الرقمي للمنطقة")}
            </h2>
            <p className="mt-4 max-w-lg text-primary-foreground/70">
              {T(
                "Tell us about your business and the markets you serve. Our partner team reviews every application personally and replies within two business days.",
                "أخبرنا عن شركتك والأسواق التي تخدمها. يراجع فريق الشركاء كل طلب شخصيًا ويرد خلال يومي عمل.",
              )}
            </p>
            <ul className="mt-8 space-y-3">
              {[
                T("No joining fee, no minimum purchase", "دون رسوم انضمام أو حد أدنى للشراء"),
                T("Certification and demo tenant included", "الشهادات وبيئة العرض مشمولة"),
                T("Territory protection on registered deals", "حماية المنطقة على الصفقات المسجّلة"),
              ].map((x) => (
                <li key={x} className="flex items-center gap-3 text-sm text-primary-foreground/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-name">
                  {T("Full name", "الاسم الكامل")} *
                </label>
                <Input
                  id="p-name"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-email">
                  {T("Work email", "البريد الإلكتروني")} *
                </label>
                <Input
                  id="p-email"
                  type="email"
                  required
                  value={form.work_email}
                  onChange={(e) => setForm({ ...form, work_email: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-company">
                  {T("Company", "الشركة")}
                </label>
                <Input
                  id="p-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-phone">
                  {T("Phone", "الهاتف")}
                </label>
                <Input
                  id="p-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-country">
                  {T("Country / territory", "الدولة / المنطقة")}
                </label>
                <Input
                  id="p-country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-primary-foreground/70" htmlFor="p-msg">
                  {T("Tell us about your business", "أخبرنا عن شركتك")}
                </label>
                <Textarea
                  id="p-msg"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitLead.isPending}
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitLead.isPending ? T("Sending…", "جارٍ الإرسال…") : T("Submit application", "إرسال الطلب")}
            </Button>
            <p className="mt-3 text-center text-xs text-primary-foreground/50">
              {T("We reply within 2 business days.", "نرد خلال يومي عمل.")}
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Partners;
