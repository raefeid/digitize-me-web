import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "Hero",
    textSection: "hero",
    fields: [
      { kind: "text", key: "title", label: "Title", bilingual: true },
      { kind: "textarea", key: "description", label: "Description", bilingual: true },
    ],
  },
  {
    title: "Buttons",
    textSection: "cta",
    fields: [
      { kind: "text", key: "back_home_label", label: "Back-home button", bilingual: true },
      { kind: "text", key: "go_back_label", label: "Go back button", bilingual: true },
      { kind: "text", key: "contact_support_label", label: "Contact support button", bilingual: true },
    ],
  },
];

const NotFoundPageEditor = () => (
  <PageEditor page="not_found" pageTitle="404 Page (Page not found)" sections={SECTIONS} />
);

export default NotFoundPageEditor;
