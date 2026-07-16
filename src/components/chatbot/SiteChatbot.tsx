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

const KB: KBEntry[] = [
  {
    keywords: ["price", "pricing", "cost", "how much", "plan", "plans", "subscription", "سعر", "أسعار", "تكلفة", "باقة"],
    answer_en:
      "Our plans start free — try now, pay later. Paid tiers: Business Entry from $99/mo, and higher tiers for enterprise volume. Full comparison on the pricing page.",
    answer_ar:
      "الباقات تبدأ مجاناً — جرّب الآن وادفع لاحقاً. الباقات المدفوعة تبدأ من 99$ شهرياً لباقة Business Entry. راجع صفحة الأسعار للمقارنة الكاملة.",
    link: { label_en: "See pricing", label_ar: "عرض الأسعار", to: "/pricing" },
  },
  {
    keywords: ["free", "trial", "try", "start free", "مجاني", "تجربة"],
    answer_en:
      "Yes — Start Free lets you try now and pay later. Setup takes about 2 minutes and works with Google Drive and OneDrive.",
    answer_ar:
      "نعم — يمكنك البدء مجاناً والدفع لاحقاً. الإعداد يستغرق دقيقتين تقريباً ويعمل مع Google Drive و OneDrive.",
    link: { label_en: "Start free", label_ar: "ابدأ مجاناً", to: "/pricing" },
  },
  {
    keywords: ["google drive", "onedrive", "sharepoint", "integration", "integrations", "connect", "تكامل", "ربط"],
    answer_en:
      "We integrate with Google Drive, OneDrive, SharePoint, and more. Connect your existing storage in minutes.",
    answer_ar: "نتكامل مع Google Drive و OneDrive و SharePoint وغيرها. اربط تخزينك الحالي خلال دقائق.",
    link: { label_en: "See integrations", label_ar: "عرض التكاملات", to: "/integrations" },
  },
  {
    keywords: ["ocr", "scan", "scanning", "arabic", "bilingual", "مسح", "عربي"],
    answer_en:
      "Our OCR reads both Arabic and English documents, extracts structured data, and makes every scanned document searchable.",
    answer_ar:
      "محرك OCR لدينا يقرأ المستندات بالعربية والإنجليزية، ويستخرج البيانات المنظمة، ويجعل كل مستند ممسوح قابلاً للبحث.",
    link: { label_en: "See product", label_ar: "عرض المنتج", to: "/product" },
  },
  {
    keywords: ["industry", "industries", "sector", "law", "legal", "accounting", "healthcare", "real estate", "government", "banking", "قطاع", "قانون", "محاسبة", "صحة"],
    answer_en:
      "We serve Law Firms, Accounting, Real Estate, Healthcare, Government, and Banking & Finance — with tailored workflows per industry.",
    answer_ar:
      "نخدم مكاتب المحاماة والمحاسبة والعقارات والرعاية الصحية والحكومة والبنوك والتمويل — بسير عمل مخصص لكل قطاع.",
    link: { label_en: "Browse industries", label_ar: "تصفح القطاعات", to: "/industries" },
  },
  {
    keywords: ["security", "secure", "compliance", "gdpr", "uae", "hosting", "أمان", "حماية"],
    answer_en:
      "Data is hosted in the UAE with enterprise-grade encryption, role-based access, audit trails, and compliance controls.",
    answer_ar:
      "البيانات مستضافة في الإمارات مع تشفير على مستوى المؤسسات، وصلاحيات مبنية على الأدوار، وسجلات تدقيق، وضوابط امتثال.",
  },
  {
    keywords: ["contact", "sales", "demo", "talk", "call", "email", "تواصل", "مبيعات", "عرض"],
    answer_en: "Happy to help — book a demo or reach our team from the contact page.",
    answer_ar: "يسعدنا مساعدتك — احجز عرضاً توضيحياً أو تواصل مع فريقنا من صفحة الاتصال.",
    link: { label_en: "Contact us", label_ar: "تواصل معنا", to: "/contact" },
  },
  {
    keywords: ["about", "who", "infasme", "company", "من", "عن", "شركة"],
    answer_en:
      "Digitize me is crafted by Infasme — 30+ years of ECM expertise, purpose-built for MENA SMEs.",
    answer_ar: "Digitize me من تطوير Infasme — أكثر من 30 عاماً من الخبرة في إدارة المحتوى المؤسسي، مصمم لشركات المنطقة.",
    link: { label_en: "About us", label_ar: "من نحن", to: "/about" },
  },
  {
    keywords: ["feature", "features", "what can", "capabilities", "ميزات", "خصائص"],
    answer_en:
      "Core features: document workspace, OCR, auto-classification, summarization, document chat, and knowledge graph.",
    answer_ar: "الميزات الأساسية: مساحة عمل المستندات، OCR، التصنيف التلقائي، التلخيص، الدردشة مع المستندات، والرسم البياني المعرفي.",
    link: { label_en: "See features", label_ar: "عرض الميزات", to: "/features" },
  },
  {
    keywords: ["setup", "how long", "install", "start", "quick", "إعداد", "تثبيت"],
    answer_en: "Setup takes about 2 minutes. Connect your Google Drive or OneDrive and you're ready to go.",
    answer_ar: "الإعداد يستغرق دقيقتين تقريباً. اربط Google Drive أو OneDrive وابدأ فوراً.",
  },
];

const FALLBACK_EN =
  "I couldn't find that on the site. Try asking about pricing, features, integrations, industries, security, OCR, or contact.";
const FALLBACK_AR =
  "لم أجد إجابة على الموقع. جرّب السؤال عن الأسعار، الميزات، التكاملات، القطاعات، الأمان، OCR، أو التواصل.";

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
