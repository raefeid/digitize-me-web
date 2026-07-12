import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "features",
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
      { kind: "textarea", key: "subtitle", label: "Description", bilingual: true },
    ],
  },
  {
    title: "Grid UI labels",
    textSection: "ui",
    fields: [
      { kind: "text", key: "loading_label", label: "Loading label", bilingual: true },
      { kind: "textarea", key: "empty_label", label: "Empty state label", bilingual: true },
      { kind: "text", key: "learn_more_label", label: "Learn more label", bilingual: true },
    ],
  },
  {
    title: "Final CTA",
    textSection: "cta",
    fields: [
      { kind: "text", key: "title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "CTA description", bilingual: true },
    ],
  },
];

const FeaturesPageEditor = () => (
  <PageEditor page="features" pageTitle="Features Index Page" sections={SECTIONS} />
);

export default FeaturesPageEditor;
