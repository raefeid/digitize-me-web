import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { FaqItem } from "@/lib/jsonLd";

interface Props {
  faqs: FaqItem[];
  industryName: string;
  heading?: string;
  intro?: string;
}

/**
 * Visible FAQ accordion shown on every industry landing page. The same FAQ
 * array is also passed up to <SEOHead> so it gets emitted as JSON-LD FAQPage
 * for Google rich results & AI assistant citation.
 *
 * Headings use semantic h2/h3 so search engines can extract Q&A structure.
 */
const IndustryFaqSection = ({ faqs, industryName, heading, intro }: Props) => {
  const { lang, isRTL } = useLanguage();
  if (!faqs || faqs.length === 0) return null;

  const fallbackHeading =
    lang === "ar"
      ? `الأسئلة الشائعة لقطاع ${industryName}`
      : `${industryName} — Frequently Asked Questions`;
  const fallbackSub =
    lang === "ar"
      ? "إجابات سريعة على أكثر الأسئلة طرحاً حول OCR وإدارة المستندات في هذا القطاع."
      : "Quick answers about OCR, document management, and AI document processing for this industry.";

  return (
    <section
      className="section-padding bg-background"
      aria-label={`${industryName} frequently asked questions`}
    >
      <div className="container-max max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className={`text-center mb-8 ${isRTL ? "text-right" : ""}`}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{heading ?? fallbackHeading}</h2>
          <p className="text-muted-foreground text-sm">{intro ?? fallbackSub}</p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-border last:border-b"
            >
              <AccordionTrigger className="text-start text-base font-semibold text-foreground hover:text-accent">
                <h3 className="font-semibold text-base m-0">{faq.question}</h3>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default IndustryFaqSection;
