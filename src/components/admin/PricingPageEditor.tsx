import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "pricing",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", bilingual: false },
    ],
  },
  {
    title: "Hero",
    textSection: "hero",
    fields: [
      { kind: "text", key: "badge", label: "Top badge", bilingual: true },
      { kind: "text", key: "title", label: "Headline", bilingual: true },
      { kind: "textarea", key: "description", label: "Description", bilingual: true },
      { kind: "text", key: "monthly_label", label: "Monthly toggle label", bilingual: true },
      { kind: "text", key: "yearly_label", label: "Yearly toggle label", bilingual: true },
    ],
  },
  {
    title: "On-premise CTA section",
    textSection: "onprem",
    fields: [
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "description", label: "Section description", bilingual: true },
      { kind: "text", key: "cta", label: "Button label", bilingual: true },
    ],
  },
  {
    title: "FAQ section",
    textSection: "faq",
    fields: [
      { kind: "text", key: "title", label: "FAQ title", bilingual: true },
      { kind: "text", key: "faq1_q", label: "FAQ 1 question", bilingual: true },
      { kind: "textarea", key: "faq1_a", label: "FAQ 1 answer", bilingual: true },
      { kind: "text", key: "faq2_q", label: "FAQ 2 question", bilingual: true },
      { kind: "textarea", key: "faq2_a", label: "FAQ 2 answer", bilingual: true },
      { kind: "text", key: "faq3_q", label: "FAQ 3 question", bilingual: true },
      { kind: "textarea", key: "faq3_a", label: "FAQ 3 answer", bilingual: true },
      { kind: "text", key: "faq4_q", label: "FAQ 4 question", bilingual: true },
      { kind: "textarea", key: "faq4_a", label: "FAQ 4 answer", bilingual: true },
      { kind: "text", key: "faq5_q", label: "FAQ 5 question", bilingual: true },
      { kind: "textarea", key: "faq5_a", label: "FAQ 5 answer", bilingual: true },
      { kind: "text", key: "faq6_q", label: "FAQ 6 question", bilingual: true },
      { kind: "textarea", key: "faq6_a", label: "FAQ 6 answer", bilingual: true },
    ],
  },
];

const PricingPageEditor = () => (
  <PageEditor page="pricing" pageTitle="Pricing Page (text & SEO only)" sections={SECTIONS} />
);

export default PricingPageEditor;
