import PageEditor, { SectionConfig } from "./PageEditor";
import TrustedLogosEditor from "./TrustedLogosEditor";
import AioToolsEditor from "./AioToolsEditor";

const HOME_SECTIONS: SectionConfig[] = [
  {
    title: "SEO & Meta",
    description: "Page title and description for search engines and social shares.",
    textSection: "home",
    fields: [
      { kind: "text", key: "meta_title", label: "Meta title", placeholder: "Page title for Google", bilingual: false },
      { kind: "textarea", key: "meta_description", label: "Meta description", placeholder: "Short description (~155 chars)", bilingual: false },
    ],
  },
  {
    title: "Hero Section",
    description: "The main banner at the top of the home page.",
    textSection: "home",
    fields: [
      { kind: "text", key: "hero_badge", label: "Top badge text", bilingual: true },
      { kind: "text", key: "hero_title", label: "Main headline", bilingual: true },
      { kind: "text", key: "hero_rotate1", label: "Rotating word #1", bilingual: true },
      { kind: "text", key: "hero_rotate2", label: "Rotating word #2", bilingual: true },
      { kind: "text", key: "hero_rotate3", label: "Rotating word #3", bilingual: true },
      { kind: "textarea", key: "hero_desc", label: "Subheading description", bilingual: true },
      { kind: "text", key: "hero_cta1", label: "Primary CTA label", bilingual: true },
      { kind: "text", key: "hero_cta2", label: "Secondary CTA label", bilingual: true },
      {
        kind: "image",
        key: "hero_search_image",
        label: "Hero left visual (search preview)",
        help: "Optional. Replaces the animated search preview with an image.",
      },
      {
        kind: "image",
        key: "hero_visual_image",
        label: "Hero right visual",
        help: "Optional. Replaces the animated AI illustration with an image.",
      },
    ],
  },
  {
    title: "Stats Bar",
    description: "Four numbers shown under the hero.",
    textSection: "home",
    fields: [
      { kind: "text", key: "stat_retrieval_value", label: "Stat 1 — value", bilingual: false },
      { kind: "text", key: "stat_retrieval_label", label: "Stat 1 — label", bilingual: true },
      { kind: "text", key: "stat_time_value", label: "Stat 2 — value", bilingual: false },
      { kind: "text", key: "stat_time_label", label: "Stat 2 — label", bilingual: true },
      { kind: "text", key: "stat_experience_value", label: "Stat 3 — value", bilingual: false },
      { kind: "text", key: "stat_experience_label", label: "Stat 3 — label", bilingual: true },
      { kind: "text", key: "stat_smes_value", label: "Stat 4 — value", bilingual: false },
      { kind: "text", key: "stat_smes_label", label: "Stat 4 — label", bilingual: true },
    ],
  },
  {
    title: "How It Works (Workflow)",
    textSection: "home",
    fields: [
      { kind: "text", key: "workflow_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "workflow_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "workflow_desc", label: "Section description", bilingual: true },
      {
        kind: "image",
        key: "workflow_image",
        label: "Workflow illustration",
        help: "Optional. Replaces the animated document flow with an image.",
      },
    ],
  },
  {
    title: "AI & OCR Section",
    textSection: "home",
    fields: [
      { kind: "text", key: "ai_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "ai_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "ai_desc", label: "Section description", bilingual: true },
      { kind: "text", key: "ai_feat1", label: "Feature bullet 1", bilingual: true },
      { kind: "text", key: "ai_feat2", label: "Feature bullet 2", bilingual: true },
      { kind: "text", key: "ai_feat3", label: "Feature bullet 3", bilingual: true },
      { kind: "text", key: "ai_feat4", label: "Feature bullet 4", bilingual: true },
      { kind: "text", key: "ai_feat5", label: "Feature bullet 5", bilingual: true },
      {
        kind: "image",
        key: "ai_ocr_image",
        label: "OCR visual",
        help: "Optional. Replaces the animated OCR scan visual.",
      },
    ],
  },
  {
    title: "Features Grid",
    textSection: "home",
    fields: [
      { kind: "text", key: "features_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "features_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "features_desc", label: "Section description", bilingual: true },
      { kind: "text", key: "feat_ocr_title", label: "Feature 1 — title", bilingual: true },
      { kind: "textarea", key: "feat_ocr_desc", label: "Feature 1 — description", bilingual: true },
      { kind: "text", key: "feat_search_title", label: "Feature 2 — title", bilingual: true },
      { kind: "textarea", key: "feat_search_desc", label: "Feature 2 — description", bilingual: true },
      { kind: "text", key: "feat_security_title", label: "Feature 3 — title", bilingual: true },
      { kind: "textarea", key: "feat_security_desc", label: "Feature 3 — description", bilingual: true },
      { kind: "text", key: "feat_workflow_title", label: "Feature 4 — title", bilingual: true },
      { kind: "textarea", key: "feat_workflow_desc", label: "Feature 4 — description", bilingual: true },
      { kind: "text", key: "feat_access_title", label: "Feature 5 — title", bilingual: true },
      { kind: "textarea", key: "feat_access_desc", label: "Feature 5 — description", bilingual: true },
      { kind: "text", key: "feat_classify_title", label: "Feature 6 — title", bilingual: true },
      { kind: "textarea", key: "feat_classify_desc", label: "Feature 6 — description", bilingual: true },
    ],
  },
  {
    title: "Trusted By",
    description: "Section heading; manage individual logos in the panel above.",
    textSection: "trusted",
    fields: [
      { kind: "text", key: "trusted_title", label: "Section heading", bilingual: true },
    ],
  },
  {
    title: "All-in-One Platform",
    textSection: "allinone",
    fields: [
      { kind: "text", key: "aio_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "aio_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "aio_desc", label: "Section description", bilingual: true },
    ],
  },
  {
    title: "Before / After",
    textSection: "before_after",
    fields: [
      { kind: "text", key: "ba_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "ba_title", label: "Section title", bilingual: true },
    ],
  },
  {
    title: "Security",
    textSection: "security",
    fields: [
      { kind: "text", key: "security_label", label: "Section badge", bilingual: true },
      { kind: "text", key: "security_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "security_desc", label: "Section description", bilingual: true },
      {
        kind: "image",
        key: "security_image",
        label: "Security illustration",
        help: "Optional. Replaces the animated shield illustration.",
      },
    ],
  },
  {
    title: "Industries Section",
    textSection: "home",
    fields: [
      { kind: "text", key: "industries_badge", label: "Section badge", bilingual: true },
      { kind: "text", key: "industries_title", label: "Section title", bilingual: true },
      { kind: "textarea", key: "industries_desc", label: "Section description", bilingual: true },
    ],
  },
  {
    title: "Final Call-To-Action",
    textSection: "home",
    fields: [
      { kind: "text", key: "cta_title", label: "CTA title", bilingual: true },
      { kind: "textarea", key: "cta_desc", label: "CTA description", bilingual: true },
      { kind: "text", key: "cta_start", label: "Primary button label", bilingual: true },
      { kind: "text", key: "cta_sales", label: "Secondary button label", bilingual: true },
    ],
  },
];

const HomePageEditor = () => {
  return (
    <PageEditor
      page="home"
      pageTitle="Home Page"
      sections={HOME_SECTIONS}
      topSlot={
        <div className="space-y-6">
          <TrustedLogosEditor />
          <AioToolsEditor />
        </div>
      }
    />
  );
};

export default HomePageEditor;
