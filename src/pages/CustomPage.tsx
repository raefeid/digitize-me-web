import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCustomPageBySlug } from "@/hooks/useCustomPages";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import NotFound from "./NotFound";

const CustomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const { data: page, isLoading } = useCustomPageBySlug(slug);
  const isAr = lang === "ar";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      </Layout>
    );
  }

  if (!page || page.status !== "published") {
    return <NotFound />;
  }

  const blocks = (isAr && page.blocks_ar?.length ? page.blocks_ar : page.blocks) ?? [];
  const title = (isAr && page.title_ar) || page.title;
  const seoTitle = (isAr && page.seo_title_ar) || page.seo_title || `${title} | Digitize me`;
  const seoDesc = (isAr && page.seo_description_ar) || page.seo_description || "";

  // Aggregate FAQ items from all FAQ blocks → emitted as FAQPage schema by SEOHead
  const faqs = blocks
    .filter((b): b is Extract<typeof b, { type: "faq" }> => b.type === "faq")
    .flatMap((b) => (b.items ?? []))
    .filter((it) => it?.q && it?.a)
    .map((it) => ({ question: String(it.q), answer: String(it.a) }));

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        path={`/${page.slug}`}
        pageKey={`custom-${page.slug}`}
        faqs={faqs.length > 0 ? faqs : undefined}
      />
      {blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
      <CustomBlocksRenderer page={`custom_${page.slug}`} />
      <AddBlockButton page={`custom_${page.slug}`} />
    </Layout>
  );
};

export default CustomPage;
