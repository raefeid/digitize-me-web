import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import type { FaqItem } from "@/lib/jsonLd";

/**
 * Extract FAQ Q&A pairs from rendered blog HTML.
 * Supports two patterns commonly used in our posts:
 *  1) <details><summary>Q</summary><p>A</p></details>
 *  2) Headings like <h3>Q?</h3><p>A</p> inside a section/div with class containing "faq"
 */
const extractFaqsFromHtml = (html: string): FaqItem[] => {
  if (!html || typeof window === "undefined") return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const faqs: FaqItem[] = [];

    // Pattern 1: <details><summary>...</summary>...</details>
    doc.querySelectorAll("details").forEach((d) => {
      const q = d.querySelector("summary")?.textContent?.trim();
      const summary = d.querySelector("summary");
      let answer = "";
      d.childNodes.forEach((n) => {
        if (n !== summary) answer += (n as HTMLElement).textContent || "";
      });
      answer = answer.replace(/\s+/g, " ").trim();
      if (q && answer) faqs.push({ question: q, answer });
    });

    // Pattern 2: any h2/h3 ending in "?" followed by a <p>
    if (faqs.length === 0) {
      doc.querySelectorAll("h2, h3").forEach((h) => {
        const q = h.textContent?.trim();
        if (!q || !q.endsWith("?")) return;
        const next = h.nextElementSibling;
        const a = next?.textContent?.trim();
        if (a) faqs.push({ question: q, answer: a });
      });
    }

    return faqs.slice(0, 20); // cap to keep schema reasonable
  } catch {
    return [];
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name, name_ar, slug)")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Related posts: 3 most-recent published posts in the same category, excluding current
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-posts", post?.category_id, post?.id],
    queryFn: async () => {
      if (!post?.category_id) return [];
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, title_ar, excerpt, excerpt_ar, featured_image_url, published_at")
        .eq("published", true)
        .eq("category_id", post.category_id)
        .neq("id", post.id)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!post?.category_id && !!post?.id,
  });

  const getTitle = () => (lang === "ar" && post?.title_ar ? post.title_ar : post?.title ?? "");
  const getContent = () => (lang === "ar" && post?.content_ar ? post.content_ar : post?.content ?? "");
  const getExcerpt = () => (lang === "ar" && post?.excerpt_ar ? post.excerpt_ar : post?.excerpt ?? "");

  if (isLoading) {
    return (
      <Layout>
        <div className="section-padding container-max">
          <div className="max-w-3xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="section-padding container-max text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isRTL ? "المقال غير موجود" : "Post not found"}
          </h1>
          <Link to="/blog" className="text-accent hover:underline">
            {isRTL ? "العودة إلى المدونة" : "Back to Blog"}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${getTitle()} | Digitize me Blog`}
        description={getExcerpt()}
        path={`/blog/${slug}`}
        type="article"
        article={{
          headline: getTitle(),
          description: getExcerpt(),
          image: post.featured_image_url || undefined,
          datePublished: post.published_at || post.created_at,
          dateModified: post.updated_at,
          url: `https://www.digitizeme.ae/blog/${slug}`,
        }}
        faqs={extractFaqsFromHtml(getContent())}
      />
      <article className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-8">
              <ArrowLeft size={14} /> {isRTL ? "العودة إلى المدونة" : "Back to Blog"}
            </Link>

            {post.blog_categories && (
              <Badge variant="secondary" className="mb-4">
                {lang === "ar" && post.blog_categories.name_ar ? post.blog_categories.name_ar : post.blog_categories.name}
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {getTitle()}
            </h1>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString(
                        lang === "ar" ? "ar-AE" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )
                    : ""}
                </span>
              </div>
            </div>

            {post.featured_image_url && (
              <div className="rounded-2xl overflow-hidden mb-10">
                <img
                  src={post.featured_image_url}
                  alt={getTitle()}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground [&_.text-primary-foreground]:!text-primary-foreground [&_.text-primary-foreground_*]:!text-inherit [&_.text-primary-foreground_h3]:!text-primary-foreground [&_.text-primary-foreground_p]:!text-primary-foreground/90 [&_.text-primary-foreground_a]:!text-accent-foreground"
              dangerouslySetInnerHTML={{ __html: getContent() }}
            />
          </motion.div>

          {relatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="mt-20 pt-12 border-t border-border"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {isRTL ? "مقالات ذات صلة" : "Related posts"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {isRTL
                  ? "تابع القراءة في نفس الفئة"
                  : "Keep exploring the same category"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => {
                  const rpTitle =
                    lang === "ar" && rp.title_ar ? rp.title_ar : rp.title;
                  const rpExcerpt =
                    lang === "ar" && rp.excerpt_ar ? rp.excerpt_ar : rp.excerpt;
                  return (
                    <Link
                      key={rp.id}
                      to={`/blog/${rp.slug}`}
                      className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all"
                    >
                      {rp.featured_image_url ? (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={rp.featured_image_url}
                            alt={rpTitle}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/40" />
                      )}
                      <div className="p-5 flex flex-col gap-2 flex-1">
                        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {rpTitle}
                        </h3>
                        {rpExcerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {rpExcerpt}
                          </p>
                        )}
                        <span className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          {isRTL ? "اقرأ المزيد" : "Read more"}
                          <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}
        </div>
      </article>
      <CustomBlocksRenderer page={`blog_post_${slug}`} />
      <AddBlockButton page={`blog_post_${slug}`} />
    </Layout>
  );
};

export default BlogPost;
