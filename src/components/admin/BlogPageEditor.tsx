import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    textSection: "blog",
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
      { kind: "textarea", key: "subtitle", label: "Sub-heading", bilingual: true },
    ],
  },
  {
    title: "UI labels",
    textSection: "ui",
    fields: [
      { kind: "text", key: "filter_all", label: "Filter — All", bilingual: true },
      { kind: "text", key: "read_more_label", label: "Card link — Read more", bilingual: true },
      { kind: "text", key: "empty_label", label: "Empty state message", bilingual: true },
    ],
  },
];

const BlogPageEditor = () => (
  <PageEditor page="blog" pageTitle="Blog Page (shell)" sections={SECTIONS} />
);

export default BlogPageEditor;
