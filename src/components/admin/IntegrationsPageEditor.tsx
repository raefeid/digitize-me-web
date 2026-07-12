import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
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
    title: "Categories intro",
    textSection: "categories",
    fields: [
      { kind: "text", key: "badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "Section description", bilingual: true },
      { kind: "text", key: "cat_erp_title", label: "ERP card title", bilingual: true },
      { kind: "textarea", key: "cat_erp_desc", label: "ERP card description", bilingual: true },
      { kind: "text", key: "cat_crm_title", label: "CRM card title", bilingual: true },
      { kind: "textarea", key: "cat_crm_desc", label: "CRM card description", bilingual: true },
      { kind: "text", key: "cat_cloud_storage_title", label: "Cloud storage card title", bilingual: true },
      { kind: "textarea", key: "cat_cloud_storage_desc", label: "Cloud storage card description", bilingual: true },
      { kind: "text", key: "cat_productivity_title", label: "Productivity card title", bilingual: true },
      { kind: "textarea", key: "cat_productivity_desc", label: "Productivity card description", bilingual: true },
      { kind: "text", key: "cat_custom_api_title", label: "Custom API card title", bilingual: true },
      { kind: "textarea", key: "cat_custom_api_desc", label: "Custom API card description", bilingual: true },
    ],
  },
  {
    title: "API section",
    textSection: "api",
    fields: [
      { kind: "text", key: "badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "Section description", bilingual: true },
      { kind: "text", key: "cta_docs", label: "API docs button", bilingual: true },
      { kind: "text", key: "cta_access", label: "API access button", bilingual: true },
    ],
  },
  {
    title: "Workflow section",
    textSection: "workflow",
    fields: [
      { kind: "text", key: "badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "Section description", bilingual: true },
    ],
  },
  {
    title: "Security section",
    textSection: "security",
    fields: [
      { kind: "text", key: "badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "Section description", bilingual: true },
    ],
  },
  {
    title: "Final CTA",
    textSection: "cta",
    fields: [
      { kind: "text", key: "title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "subtitle", label: "CTA description", bilingual: true },
      { kind: "text", key: "btn_trial", label: "Primary button label", bilingual: true },
      { kind: "text", key: "btn_demo", label: "Secondary button label", bilingual: true },
    ],
  },
  {
    title: "UI labels",
    textSection: "ui",
    fields: [
      { kind: "text", key: "search_placeholder", label: "Search placeholder", bilingual: true },
      { kind: "text", key: "empty_title", label: "Empty state title", bilingual: true },
      { kind: "textarea", key: "empty_desc", label: "Empty state description", bilingual: true },
    ],
  },
];

const IntegrationsPageEditor = () => (
  <PageEditor page="integrations" pageTitle="Integrations Page" sections={SECTIONS} />
);

export default IntegrationsPageEditor;