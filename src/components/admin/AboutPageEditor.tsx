import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    description: "Search engine title and description for the About page.",
    textSection: "meta",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", bilingual: false },
    ],
  },
  {
    title: "Hero",
    textSection: "hero",
    fields: [
      { kind: "text", key: "eyebrow", label: "Top badge", bilingual: true },
      { kind: "text", key: "title", label: "Headline", bilingual: true },
      { kind: "textarea", key: "desc", label: "Sub-heading", bilingual: true },
      { kind: "text", key: "cta_primary", label: "Primary CTA label", bilingual: true },
    ],
  },
  {
    title: "Story Timeline",
    description: "The 30+ year history section.",
    textSection: "story",
    fields: [
      { kind: "text", key: "eyebrow", label: "Top badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "desc", label: "Section description", bilingual: true },
      { kind: "text", key: "m1_year", label: "Milestone 1 — year", bilingual: false },
      { kind: "text", key: "m1_title", label: "Milestone 1 — title", bilingual: true },
      { kind: "textarea", key: "m1_desc", label: "Milestone 1 — description", bilingual: true },
      { kind: "text", key: "m2_year", label: "Milestone 2 — year", bilingual: false },
      { kind: "text", key: "m2_title", label: "Milestone 2 — title", bilingual: true },
      { kind: "textarea", key: "m2_desc", label: "Milestone 2 — description", bilingual: true },
      { kind: "text", key: "m3_year", label: "Milestone 3 — year", bilingual: false },
      { kind: "text", key: "m3_title", label: "Milestone 3 — title", bilingual: true },
      { kind: "textarea", key: "m3_desc", label: "Milestone 3 — description", bilingual: true },
      { kind: "text", key: "m4_year", label: "Milestone 4 — year", bilingual: false },
      { kind: "text", key: "m4_title", label: "Milestone 4 — title", bilingual: true },
      { kind: "textarea", key: "m4_desc", label: "Milestone 4 — description", bilingual: true },
      { kind: "text", key: "m5_year", label: "Milestone 5 — year", bilingual: false },
      { kind: "text", key: "m5_title", label: "Milestone 5 — title", bilingual: true },
      { kind: "textarea", key: "m5_desc", label: "Milestone 5 — description", bilingual: true },
      { kind: "text", key: "m6_year", label: "Milestone 6 — year", bilingual: false },
      { kind: "text", key: "m6_title", label: "Milestone 6 — title", bilingual: true },
      { kind: "textarea", key: "m6_desc", label: "Milestone 6 — description", bilingual: true },
    ],
  },
  {
    title: "Founder's Message",
    description: "Raef Eid portrait, title and signed message.",
    textSection: "founder",
    imageSection: "overrides",
    fields: [
      { kind: "image", key: "founder_portrait", label: "Founder portrait" },
      { kind: "text", key: "name", label: "Founder name", bilingual: false },
      { kind: "text", key: "title", label: "Founder title", bilingual: true },
      { kind: "text", key: "eyebrow", label: "Top badge", bilingual: true },
      { kind: "text", key: "heading", label: "Quote heading", bilingual: true },
      { kind: "textarea", key: "message", label: "Message body", bilingual: true },
      { kind: "text", key: "signature", label: "Signature line", bilingual: false },
    ],
  },
  {
    title: "UAE Trust Block",
    description: "The 3 pillars under the UAE hosting section.",
    textSection: "uae",
    fields: [
      { kind: "text", key: "eyebrow", label: "Top badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "desc", label: "Section description", bilingual: true },
      { kind: "text", key: "p1_title", label: "Pillar 1 — title", bilingual: true },
      { kind: "textarea", key: "p1_desc", label: "Pillar 1 — description", bilingual: true },
      { kind: "text", key: "p2_title", label: "Pillar 2 — title", bilingual: true },
      { kind: "textarea", key: "p2_desc", label: "Pillar 2 — description", bilingual: true },
      { kind: "text", key: "p3_title", label: "Pillar 3 — title", bilingual: true },
      { kind: "textarea", key: "p3_desc", label: "Pillar 3 — description", bilingual: true },
    ],
  },
  {
    title: "CTA Footer",
    textSection: "cta",
    fields: [
      { kind: "text", key: "title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "desc", label: "CTA description", bilingual: true },
      { kind: "text", key: "cta_label", label: "Button label", bilingual: true },
    ],
  },
];

const AboutPageEditor = () => (
  <PageEditor page="about" pageTitle="About Page" sections={SECTIONS} />
);

export default AboutPageEditor;
