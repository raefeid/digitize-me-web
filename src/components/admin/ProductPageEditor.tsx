import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "product",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", bilingual: false },
    ],
  },
  {
    title: "Hero",
    textSection: "hero",
    fields: [
      { kind: "text", key: "product_badge", label: "Top badge", bilingual: true },
      { kind: "text", key: "product_title", label: "Headline", bilingual: true },
      { kind: "textarea", key: "product_desc", label: "Description", bilingual: true },
      { kind: "image", key: "hero_dashboard", label: "Hero illustration", help: "Optional. Replaces the animated dashboard." },
    ],
  },
  {
    title: "AI & OCR section",
    description: "Tip: feature cards are edited directly from the live page; this panel controls the section heading and visual.",
    textSection: "ai",
    fields: [
      { kind: "text", key: "product_ai_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "product_ai_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "product_ai_desc", label: "Section description", bilingual: true },
      { kind: "image", key: "ai_engine", label: "AI/OCR visual", help: "Optional. Replaces the animated OCR engine." },
    ],
  },
  {
    title: "How it works",
    textSection: "how",
    fields: [
      { kind: "text", key: "product_how_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "product_how_title", label: "Section title", bilingual: true },
      { kind: "image", key: "how_workflow", label: "Workflow visual", help: "Optional. Replaces the animated workflow visual." },
      { kind: "text", key: "product_how_step1", label: "Step 1 — title", bilingual: true },
      { kind: "textarea", key: "product_how_step1_desc", label: "Step 1 — description", bilingual: true },
      { kind: "text", key: "product_how_step2", label: "Step 2 — title", bilingual: true },
      { kind: "textarea", key: "product_how_step2_desc", label: "Step 2 — description", bilingual: true },
      { kind: "text", key: "product_how_step3", label: "Step 3 — title", bilingual: true },
      { kind: "textarea", key: "product_how_step3_desc", label: "Step 3 — description", bilingual: true },
      { kind: "text", key: "product_how_step4", label: "Step 4 — title", bilingual: true },
      { kind: "textarea", key: "product_how_step4_desc", label: "Step 4 — description", bilingual: true },
    ],
  },
  {
    title: "Delivery models",
    textSection: "delivery",
    fields: [
      { kind: "text", key: "product_delivery_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "product_delivery_title", label: "Section title", bilingual: true },
      { kind: "image", key: "delivery_image", label: "Delivery visual", help: "Optional. Replaces the animated deployment visual." },
    ],
  },
  {
    title: "Delivery — SaaS card",
    textSection: "delivery_saas",
    fields: [
      { kind: "text", key: "product_saas_title", label: "SaaS card title", bilingual: true },
      { kind: "textarea", key: "product_saas_desc", label: "SaaS card description", bilingual: true },
      { kind: "text", key: "saas_feat1", label: "SaaS feature 1", bilingual: true },
      { kind: "text", key: "saas_feat2", label: "SaaS feature 2", bilingual: true },
      { kind: "text", key: "saas_feat3", label: "SaaS feature 3", bilingual: true },
      { kind: "text", key: "saas_feat4", label: "SaaS feature 4", bilingual: true },
      { kind: "text", key: "saas_feat5", label: "SaaS feature 5", bilingual: true },
      { kind: "text", key: "saas_feat6", label: "SaaS feature 6", bilingual: true },
    ],
  },
  {
    title: "Delivery — On-premise card",
    textSection: "delivery_onprem",
    fields: [
      { kind: "text", key: "product_onprem_title", label: "On-premise card title", bilingual: true },
      { kind: "textarea", key: "product_onprem_desc", label: "On-premise card description", bilingual: true },
      { kind: "text", key: "onprem_feat1", label: "On-premise feature 1", bilingual: true },
      { kind: "text", key: "onprem_feat2", label: "On-premise feature 2", bilingual: true },
      { kind: "text", key: "onprem_feat3", label: "On-premise feature 3", bilingual: true },
      { kind: "text", key: "onprem_feat4", label: "On-premise feature 4", bilingual: true },
      { kind: "text", key: "onprem_feat5", label: "On-premise feature 5", bilingual: true },
      { kind: "text", key: "onprem_feat6", label: "On-premise feature 6", bilingual: true },
    ],
  },
  {
    title: "Why we're different",
    textSection: "diff",
    fields: [
      { kind: "text", key: "product_diff_title", label: "Section title", bilingual: true },
      { kind: "image", key: "diff_image", label: "Comparison visual", help: "Optional. Replaces the animated comparison visual." },
    ],
  },
  {
    title: "Final CTA",
    textSection: "cta",
    fields: [
      { kind: "text", key: "product_cta_title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "product_cta_desc", label: "CTA description", bilingual: true },
    ],
  },
];

const ProductPageEditor = () => (
  <PageEditor page="product" pageTitle="Product Page" sections={SECTIONS} />
);

export default ProductPageEditor;
