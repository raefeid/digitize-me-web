import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "Brand block",
    textSection: "brand",
    fields: [
      { kind: "textarea", key: "desc", label: "Tagline / description under the logo", bilingual: true },
      { kind: "text", key: "poweredBy", label: '"Powered by" label', bilingual: true },
    ],
  },
  {
    title: "Column titles",
    textSection: "cols",
    fields: [
      { kind: "text", key: "product_title", label: "Product column title", bilingual: true },
      { kind: "text", key: "industries_title", label: "Industries column title", bilingual: true },
      { kind: "text", key: "contact_title", label: "Contact column title", bilingual: true },
    ],
  },
  {
    title: "Product column links",
    textSection: "cols",
    fields: [
      { kind: "text", key: "product_features", label: "Features link label", bilingual: true },
      { kind: "text", key: "product_saas", label: "SaaS link label", bilingual: true },
      { kind: "text", key: "product_onprem", label: "On-premise link label", bilingual: true },
      { kind: "text", key: "product_aiocr", label: "AI OCR link label", bilingual: true },
      { kind: "text", key: "product_pricing", label: "Pricing link label", bilingual: true },
      { kind: "text", key: "product_blog", label: "Blog link label", bilingual: true },
    ],
  },
  {
    title: "Industries column links",
    textSection: "cols",
    fields: [
      { kind: "text", key: "ind_law", label: "Law firms label", bilingual: true },
      { kind: "text", key: "ind_acc", label: "Accounting label", bilingual: true },
      { kind: "text", key: "ind_health", label: "Healthcare label", bilingual: true },
      { kind: "text", key: "ind_re", label: "Real estate label", bilingual: true },
      { kind: "text", key: "ind_log", label: "Logistics label", bilingual: true },
      { kind: "text", key: "ind_all", label: '"All industries" label', bilingual: true },
    ],
  },
  {
    title: "Contact column",
    textSection: "contact",
    fields: [
      { kind: "text", key: "address", label: "Address", bilingual: true },
      { kind: "text", key: "email", label: "Email", bilingual: false },
      { kind: "text", key: "phone1", label: "Phone #1", bilingual: false },
      { kind: "text", key: "phone2", label: "Phone #2", bilingual: false },
    ],
  },
  {
    title: "Social links",
    description: "Full URLs (https://…) for the social icons.",
    textSection: "footer",
    fields: [
      { kind: "text", key: "social_linkedin", label: "LinkedIn URL", bilingual: false },
      { kind: "text", key: "social_facebook", label: "Facebook URL", bilingual: false },
      { kind: "text", key: "social_x", label: "X / Twitter URL", bilingual: false },
      { kind: "text", key: "social_youtube", label: "YouTube URL", bilingual: false },
    ],
  },
  {
    title: "Legal row",
    textSection: "legal",
    fields: [
      { kind: "text", key: "rights", label: "Copyright / rights line", bilingual: true },
      { kind: "text", key: "privacy", label: "Privacy link label", bilingual: true },
      { kind: "text", key: "terms", label: "Terms link label", bilingual: true },
    ],
  },
];

const FooterEditor = () => (
  <PageEditor page="footer" pageTitle="Footer" sections={SECTIONS} />
);

export default FooterEditor;
