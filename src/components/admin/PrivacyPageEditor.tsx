import PageEditor, { SectionConfig } from "./PageEditor";

/**
 * Privacy Policy admin editor.
 *
 * The legal body is a single rich-text field; admins should also use
 * the on-page Visual Editor (Open page → ⚙ Edit) to format it with
 * headings/lists/links via the floating format toolbar.
 */
const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "privacy",
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
      { kind: "text", key: "last_updated", label: 'Last-updated label (e.g. "Last updated: April 15, 2026")', bilingual: true },
    ],
  },
  {
    title: "Body (HTML allowed)",
    description:
      "Tip: open /privacy?edit=1 for the inline rich editor (bold, headings, links). The textarea here accepts raw HTML.",
    textSection: "body",
    fields: [
      { kind: "textarea", key: "content", label: "Privacy policy content (HTML)", bilingual: true },
    ],
  },
];

const PrivacyPageEditor = () => (
  <PageEditor page="privacy" pageTitle="Privacy Policy" sections={SECTIONS} />
);

export default PrivacyPageEditor;
