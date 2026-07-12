import PageEditor, { SectionConfig } from "./PageEditor";
import IndustriesContentManager from "./IndustriesContentManager";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "industries",
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
      { kind: "textarea", key: "desc", label: "Description", bilingual: true },
    ],
  },
  {
    title: "Final CTA",
    textSection: "cta",
    fields: [
      { kind: "text", key: "dontSee_title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "dontSee_desc", label: "CTA description", bilingual: true },
      { kind: "text", key: "dontSee_cta", label: "Button label", bilingual: true },
    ],
  },
];

const IndustriesPageEditor = () => (
  <div className="space-y-10">
    <PageEditor page="industries" pageTitle="Industries Page (text & SEO)" sections={SECTIONS} />
    <div className="border-t border-border pt-10">
      <IndustriesContentManager />
    </div>
  </div>
);

export default IndustriesPageEditor;
