import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import EditableText from "@/components/cms/EditableText";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

const Blog = () => {
  const { lang, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts", activeCategory],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(name, name_ar, slug)")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (activeCategory) query = query.eq("category_id", activeCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getCategoryName = (cat: { name: string; name_ar: string | null }) =>
    lang === "ar" && cat.name_ar ? cat.name_ar : cat.name;

  const getPostTitle = (post: any) =>
    lang === "ar" && post.title_ar ? post.title_ar : post.title;

  const getPostExcerpt = (post: any) =>
    lang === "ar" && post.excerpt_ar ? post.excerpt_ar : post.excerpt;

  return (
    <Layout>
      <RevealAutoScanner page="blog" />
      <SEOHead
        title="Digitize me Blog | Document Management Insights & Tips"
        description="Expert insights on document management, OCR technology, AI automation, and digital transformation for businesses in UAE and the Middle East."
        titleAr="مدونة Digitize me | رؤى وأفكار حول إدارة المستندات"
        descriptionAr="رؤى خبراء حول إدارة المستندات وتقنية التعرف الضوئي والأتمتة بالذكاء الاصطناعي والتحول الرقمي للشركات في الإمارات والشرق الأوسط."
        path="/blog"
      />

      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-12">
            <EditableText
              page="blog"
              section="hero"
              contentKey="badge"
              fallback={isRTL ? "المدونة" : "Blog"}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              as="h1"
              page="blog"
              section="hero"
              contentKey="title"
              fallback={isRTL ? "رؤى وأخبار" : "Insights & News"}
              className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4 block"
              rich
            />
            <EditableText
              as="p"
              page="blog"
              section="hero"
              contentKey="subtitle"
              multiline
              fallback={
                isRTL
                  ? "أحدث الرؤى حول إدارة المستندات والتحول الرقمي"
                  : "Latest insights on document management and digital transformation"
              }
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              rich
            />
          </motion.div>

          {/* Category Filter */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <EditableText
                page="blog"
                section="ui"
                contentKey="filter_all"
                fallback={isRTL ? "الكل" : "All"}
              />
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </motion.div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.div key={post.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-accent/30 transition-all duration-300"
                  >
                    {post.featured_image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={getPostTitle(post)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                        <Tag size={40} className="text-accent/30" />
                      </div>
                    )}
                    <div className="p-6">
                      {post.blog_categories && (
                        <Badge variant="secondary" className="mb-3 text-xs">
                          {getCategoryName(post.blog_categories)}
                        </Badge>
                      )}
                      <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {getPostTitle(post)}
                      </h2>
                      {getPostExcerpt(post) && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{getPostExcerpt(post)}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}</span>
                        </div>
                        <span className="flex items-center gap-1 text-accent font-medium group-hover:gap-2 transition-all">
                          <EditableText
                            page="blog"
                            section="ui"
                            contentKey="read_more_label"
                            fallback={isRTL ? "اقرأ المزيد" : "Read more"}
                          />
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Tag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <EditableText
                as="p"
                page="blog"
                section="ui"
                contentKey="empty_label"
                fallback={isRTL ? "لا توجد مقالات بعد. تابعنا!" : "No posts yet. Stay tuned!"}
                className="text-muted-foreground text-lg block"
              />
            </div>
          )}
        </div>
      </section>

      <CustomBlocksRenderer page="blog" />
      <AddBlockButton page="blog" />
    </Layout>
  );
};

export default Blog;
