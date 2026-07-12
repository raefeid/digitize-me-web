import PageEditor, { SectionConfig } from "./PageEditor";

const SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    description: "Search engine title and description for the Contact page.",
    textSection: "contact",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", bilingual: false },
    ],
  },
  {
    title: "Hero",
    textSection: "hero",
    fields: [
      { kind: "text", key: "contact_badge", label: "Top badge", bilingual: true },
      { kind: "text", key: "contact_title", label: "Headline", bilingual: true },
      { kind: "textarea", key: "contact_desc", label: "Sub-heading", bilingual: true },
    ],
  },
  {
    title: "Contact info card",
    description: "The labels and details under the headline (email, phone, address).",
    textSection: "info",
    fields: [
      { kind: "text", key: "email_label", label: "Email row label", bilingual: true },
      { kind: "text", key: "contact_email", label: "Email address", bilingual: false },
      { kind: "text", key: "phone_label", label: "Phone row label", bilingual: true },
      { kind: "text", key: "contact_phone1", label: "Phone #1", bilingual: false },
      { kind: "text", key: "contact_phone2", label: "Phone #2", bilingual: false },
      { kind: "text", key: "address_label", label: "Address row label", bilingual: true },
      { kind: "textarea", key: "contact_address", label: "Address", bilingual: true },
    ],
  },
  {
    title: "Form labels & placeholders",
    textSection: "form",
    fields: [
      { kind: "text", key: "form_name_label", label: "Name field label", bilingual: true },
      { kind: "text", key: "form_name_placeholder", label: "Name placeholder", bilingual: true },
      { kind: "text", key: "form_email_label", label: "Email field label", bilingual: true },
      { kind: "text", key: "form_email_placeholder", label: "Email placeholder", bilingual: true },
      { kind: "text", key: "form_company_label", label: "Company field label", bilingual: true },
      { kind: "text", key: "form_company_placeholder", label: "Company placeholder", bilingual: true },
      { kind: "text", key: "form_phone_label", label: "Phone field label", bilingual: true },
      { kind: "text", key: "form_phone_placeholder", label: "Phone placeholder", bilingual: true },
      { kind: "text", key: "form_industry_label", label: "Industry field label", bilingual: true },
      { kind: "text", key: "form_industry_placeholder", label: "Industry placeholder", bilingual: true },
      { kind: "text", key: "form_message_label", label: "Message field label", bilingual: true },
      { kind: "textarea", key: "form_message_placeholder", label: "Message placeholder", bilingual: true },
      { kind: "text", key: "form_submit_label", label: "Submit button label", bilingual: true },
      { kind: "textarea", key: "form_note", label: "Helper note under the form", bilingual: true },
    ],
  },
];

const ContactPageEditor = () => (
  <PageEditor page="contact" pageTitle="Contact Page" sections={SECTIONS} />
);

export default ContactPageEditor;
