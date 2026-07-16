import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";

/**
 * Rule-based site chatbot. Not real AI — it searches a curated
 * knowledge base of website info and returns the best-matching answer.
 */

type KBEntry = {
  keywords: string[];
  answer_en: string;
  answer_ar: string;
  link?: { label_en: string; label_ar: string; to: string };
};

// Concrete site facts — used both to answer directly and to display in cards.
export const SITE_FACTS = {
  email: "hello@digitizeme.ai",
  phone1: "+971 4 123 4567",
  phone2: "+971 50 987 6543",
  address: "Dubai Internet City, Dubai, United Arab Emirates",
  hours: "Sun–Thu, 9:00 AM – 6:00 PM (GST)",
  freePlan: "Free — try now, pay later",
  businessEntry: "$99/mo (or $69/mo billed yearly)",
  setupTime: "~2 minutes",
  hosting: "UAE data centers",
};

const KB: KBEntry[] = [
  {
    keywords: ["email", "mail", "e-mail", "بريد", "ايميل", "إيميل"],
    answer_en: `You can email us at ${SITE_FACTS.email}. We typically reply within one business day.`,
    answer_ar: `يمكنك مراسلتنا على ${SITE_FACTS.email}. نرد عادةً خلال يوم عمل واحد.`,
    link: { label_en: "Contact page", label_ar: "صفحة التواصل", to: "/contact" },
  },
  {
    keywords: ["phone", "call", "number", "whatsapp", "هاتف", "رقم", "اتصال"],
    answer_en: `Call or WhatsApp us on ${SITE_FACTS.phone1} or ${SITE_FACTS.phone2}. Hours: ${SITE_FACTS.hours}.`,
    answer_ar: `اتصل بنا أو راسلنا على واتساب: ${SITE_FACTS.phone1} أو ${SITE_FACTS.phone2}. أوقات العمل: الأحد–الخميس 9 صباحاً – 6 مساءً (توقيت الخليج).`,
    link: { label_en: "Contact page", label_ar: "صفحة التواصل", to: "/contact" },
  },
  {
    keywords: ["address", "location", "office", "where", "based", "عنوان", "موقع", "مكتب", "أين"],
    answer_en: `Our office is at ${SITE_FACTS.address}.`,
    answer_ar: `مكتبنا في ${SITE_FACTS.address}.`,
    link: { label_en: "Contact page", label_ar: "صفحة التواصل", to: "/contact" },
  },
  {
    keywords: ["contact", "reach", "get in touch", "sales", "تواصل", "مبيعات"],
    answer_en: `Here's how to reach us:\n• Email: ${SITE_FACTS.email}\n• Phone: ${SITE_FACTS.phone1}\n• Address: ${SITE_FACTS.address}\n• Hours: ${SITE_FACTS.hours}`,
    answer_ar: `طرق التواصل معنا:\n• البريد: ${SITE_FACTS.email}\n• الهاتف: ${SITE_FACTS.phone1}\n• العنوان: ${SITE_FACTS.address}\n• الأوقات: الأحد–الخميس 9 ص – 6 م`,
    link: { label_en: "Contact us", label_ar: "تواصل معنا", to: "/contact" },
  },
  {
    keywords: ["demo", "book", "meeting", "schedule", "عرض", "حجز", "موعد"],
    answer_en: `To book a demo, email ${SITE_FACTS.email} or call ${SITE_FACTS.phone1} — or use the form on the contact page. Demos usually run 20–30 minutes.`,
    answer_ar: `لحجز عرض توضيحي، راسلنا على ${SITE_FACTS.email} أو اتصل على ${SITE_FACTS.phone1}، أو استخدم النموذج في صفحة التواصل. مدة العرض عادةً 20–30 دقيقة.`,
    link: { label_en: "Book a demo", label_ar: "احجز عرضاً", to: "/contact" },
  },
  {
    keywords: ["price", "pricing", "cost", "how much", "plan", "plans", "subscription", "سعر", "أسعار", "تكلفة", "باقة"],
    answer_en: `Plans:\n• Free — try now, pay later (no card required)\n• Business Entry — ${SITE_FACTS.businessEntry}\n• Higher tiers available for enterprise volume\nOur all-in-one bundle replaces ~$10,461/mo of separate tools.`,
    answer_ar: `الباقات:\n• مجاناً — جرّب الآن وادفع لاحقاً (بدون بطاقة)\n• Business Entry — 99$ شهرياً (أو 69$ شهرياً سنوياً)\n• باقات أعلى للمؤسسات\nحزمتنا الشاملة تحل محل أدوات بقيمة ~10,461$ شهرياً.`,
    link: { label_en: "See pricing", label_ar: "عرض الأسعار", to: "/pricing" },
  },
  {
    keywords: ["free", "trial", "try", "start free", "مجاني", "تجربة"],
    answer_en: `Yes — Start Free lets you try now and pay later, no credit card required. Setup takes ~${SITE_FACTS.setupTime} and connects directly to Google Drive or OneDrive.`,
    answer_ar: `نعم — ابدأ مجاناً وادفع لاحقاً، بدون بطاقة ائتمان. الإعداد يستغرق دقيقتين تقريباً ويتصل مباشرة بـ Google Drive أو OneDrive.`,
    link: { label_en: "Start free", label_ar: "ابدأ مجاناً", to: "/pricing" },
  },
  {
    keywords: ["google drive", "onedrive", "sharepoint", "integration", "integrations", "connect", "تكامل", "ربط"],
    answer_en:
      "We integrate directly with Google Drive, OneDrive, and SharePoint — plus SAP, Salesforce, and more. No migration needed: keep your files where they are and we index them in place.",
    answer_ar:
      "نتكامل مباشرة مع Google Drive و OneDrive و SharePoint، بالإضافة إلى SAP و Salesforce وغيرها. لا حاجة للترحيل — اترك ملفاتك في مكانها ونقوم بفهرستها.",
    link: { label_en: "See integrations", label_ar: "عرض التكاملات", to: "/integrations" },
  },
  {
    keywords: ["ocr", "scan", "scanning", "arabic", "bilingual", "مسح", "عربي"],
    answer_en:
      "Our OCR reads Arabic and English (including mixed-language pages), extracts structured fields (invoices, contracts, IDs), and makes every scanned document fully searchable — even handwritten notes on many document types.",
    answer_ar:
      "محرك OCR يقرأ العربية والإنجليزية (بما في ذلك الصفحات ثنائية اللغة)، ويستخرج الحقول المنظمة (فواتير، عقود، هويات)، ويجعل كل مستند ممسوح قابلاً للبحث بالكامل.",
    link: { label_en: "See product", label_ar: "عرض المنتج", to: "/product" },
  },
  {
    keywords: ["industry", "industries", "sector", "law", "legal", "accounting", "healthcare", "real estate", "government", "banking", "قطاع", "قانون", "محاسبة", "صحة"],
    answer_en:
      "We serve 6 core industries with tailored workflows: Law Firms, Accounting, Real Estate, Healthcare, Government, and Banking & Finance.",
    answer_ar:
      "نخدم 6 قطاعات رئيسية بسير عمل مخصص: مكاتب المحاماة، المحاسبة، العقارات، الرعاية الصحية، الحكومة، والبنوك والتمويل.",
    link: { label_en: "Browse industries", label_ar: "تصفح القطاعات", to: "/industries" },
  },
  {
    keywords: ["security", "secure", "compliance", "gdpr", "uae", "hosting", "encryption", "أمان", "حماية", "تشفير"],
    answer_en:
      `Data is hosted in ${SITE_FACTS.hosting} with AES-256 encryption at rest and TLS 1.3 in transit, role-based access control, full audit trails, and compliance with UAE data-residency requirements.`,
    answer_ar:
      "البيانات مستضافة في مراكز بيانات الإمارات مع تشفير AES-256 وTLS 1.3، وصلاحيات مبنية على الأدوار، وسجلات تدقيق كاملة، والامتثال لمتطلبات إقامة البيانات الإماراتية.",
  },
  {
    keywords: ["about", "who", "infasme", "company", "من", "عن", "شركة"],
    answer_en:
      "Digitize me is crafted by Infasme — a UAE-based company with 30+ years of ECM (Enterprise Content Management) expertise, purpose-built for MENA SMEs.",
    answer_ar: "Digitize me من تطوير Infasme — شركة إماراتية بخبرة تزيد عن 30 عاماً في إدارة المحتوى المؤسسي، مصممة لشركات منطقة الشرق الأوسط.",
    link: { label_en: "About us", label_ar: "من نحن", to: "/about" },
  },
  {
    keywords: ["feature", "features", "what can", "capabilities", "ميزات", "خصائص"],
    answer_en:
      "Core features: document workspace, bilingual OCR (Arabic/English), auto-classification, AI summarization, document chat, knowledge graph, workflow & approvals, and enterprise search.",
    answer_ar: "الميزات الأساسية: مساحة عمل المستندات، OCR ثنائي اللغة، التصنيف التلقائي، التلخيص بالذكاء الاصطناعي، الدردشة مع المستندات، الرسم البياني المعرفي، وسير العمل والموافقات.",
    link: { label_en: "See features", label_ar: "عرض الميزات", to: "/features" },
  },
  {
    keywords: ["setup", "how long", "install", "start", "quick", "إعداد", "تثبيت"],
    answer_en: `Setup takes about ${SITE_FACTS.setupTime}. Sign up, connect Google Drive or OneDrive, and your documents are indexed automatically — no IT project required.`,
    answer_ar: "الإعداد يستغرق دقيقتين تقريباً. سجّل، اربط Google Drive أو OneDrive، وسيتم فهرسة مستنداتك تلقائياً — بدون مشروع تقني.",
  },
];

const FALLBACK_EN =
  `I couldn't find that specific answer on the site. You can ask me about pricing, features, OCR, integrations, industries, security, or setup — or reach the team directly:\n• Email: ${SITE_FACTS.email}\n• Phone: ${SITE_FACTS.phone1}`;
const FALLBACK_AR =
  `لم أجد إجابة محددة على الموقع. اسألني عن الأسعار، الميزات، OCR، التكاملات، القطاعات، الأمان، أو الإعداد — أو تواصل مباشرة:\n• البريد: ${SITE_FACTS.email}\n• الهاتف: ${SITE_FACTS.phone1}`;

function score(query: string, entry: KBEntry) {
  const q = query.toLowerCase();
  let s = 0;
  for (const k of entry.keywords) {
    if (q.includes(k.toLowerCase())) s += k.length;
  }
  return s;
}

function findAnswer(query: string): KBEntry | null {
  let best: { s: number; e: KBEntry } | null = null;
  for (const e of KB) {
    const s = score(query, e);
    if (s > 0 && (!best || s > best.s)) best = { s, e };
  }
  return best?.e ?? null;
}

type Msg = { role: "user" | "bot"; text: string; link?: KBEntry["link"] };

const SiteChatbot = () => {
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: isAr
        ? "مرحباً! اسألني عن الأسعار، الميزات، التكاملات، الأمان، أو أي شيء عن الموقع."
        : "Hi! Ask me about pricing, features, integrations, security, or anything about the site.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Auto-open once per browser session, shortly after landing.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("site-chatbot-auto-opened") === "1") return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("site-chatbot-auto-opened", "1");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const match = findAnswer(q);
    const botMsg: Msg = match
      ? { role: "bot", text: isAr ? match.answer_ar : match.answer_en, link: match.link }
      : { role: "bot", text: isAr ? FALLBACK_AR : FALLBACK_EN };
    setMessages((m) => [...m, { role: "user", text: q }, botMsg]);
    setInput("");
  };

  const suggestions = isAr
    ? ["كم السعر؟", "ما هي الميزات؟", "التكاملات؟", "الأمان؟"]
    : ["How much does it cost?", "What are the features?", "Integrations?", "Is it secure?"];

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={isAr ? "افتح المحادثة" : "Open chat"}
        className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-[60] h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center`}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 ${isRTL ? "left-6" : "right-6"} z-[60] w-[calc(100vw-3rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-accent/10 to-transparent">
              <div className="font-semibold text-foreground">{isAr ? "مساعد الموقع" : "Site Assistant"}</div>
              <div className="text-xs text-muted-foreground">
                {isAr ? "يجيب على أسئلتك عن الموقع" : "Answers questions about the site"}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                    {m.link && (
                      <button
                        onClick={() => {
                          navigate(isAr && !m.link!.to.startsWith("/ar") ? `/ar${m.link!.to}` : m.link!.to);
                          setOpen(false);
                        }}
                        className="mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline"
                      >
                        {isAr ? m.link.label_ar : m.link.label_en} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div className="pt-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                    {isAr ? "اقتراحات" : "Try asking"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-border flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAr ? "اكتب سؤالك..." : "Type your question..."}
                className="flex-1 px-3 py-2 rounded-xl bg-muted border border-transparent focus:border-accent focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-accent text-accent-foreground disabled:opacity-40"
                aria-label={isAr ? "إرسال" : "Send"}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteChatbot;
