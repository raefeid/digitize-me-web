import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "terms",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", bilingual: false },
    ],
  },
  {
    title: "Header",
    textSection: "hero",
    fields: [
      { kind: "text", key: "title", label: "Page title", bilingual: true },
      { kind: "text", key: "last_updated", label: "Last-updated label", bilingual: true },
    ],
  },
  {
    title: "Body (HTML allowed)",
    description:
      "Tip: open /terms?edit=1 for the inline rich editor (bold, headings, links). The textarea here accepts raw HTML.",
    textSection: "body",
    fields: [
      { kind: "textarea", key: "content", label: "Terms of service content (HTML)", bilingual: true },
    ],
  },
];

const TermsPageEditor = () => (
  <PageEditor page="terms" pageTitle="Terms of Service" sections={SECTIONS} />
);

export default TermsPageEditor;
