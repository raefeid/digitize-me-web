import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, ArrowLeft, FolderOpen, Settings, DollarSign, Image as ImageIcon, Home as HomeIcon, ImagePlus, X, Pencil, Sparkles, ChevronRight, Search, FileCode, Tag, MousePointerClick, Wand2, Users, Megaphone, Palette, Plug, MessageSquareQuote, Building, Inbox, Award, Layers, FileBox, Menu as MenuIcon, HelpCircle, AlertTriangle } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
// Lazy-load every heavy admin panel so the dashboard renders instantly and
// only the active tab's bundle is fetched. This fixes the laggy/unresponsive
// admin landing that was caused by eagerly importing 30+ editor components.
const SiteContentManager = lazy(() => import("@/components/admin/SiteContentManager"));
const PricingEditor = lazy(() => import("@/components/admin/PricingEditor"));
const MediaLibrary = lazy(() => import("@/components/admin/MediaLibrary"));
const HomePageEditor = lazy(() => import("@/components/admin/HomePageEditor"));
const ContactPageEditor = lazy(() => import("@/components/admin/ContactPageEditor"));
const ProductPageEditor = lazy(() => import("@/components/admin/ProductPageEditor"));
const PricingPageEditor = lazy(() => import("@/components/admin/PricingPageEditor"));
const IndustriesPageEditor = lazy(() => import("@/components/admin/IndustriesPageEditor"));
const FeaturesPageEditor = lazy(() => import("@/components/admin/FeaturesPageEditor"));
const BlogPageEditor = lazy(() => import("@/components/admin/BlogPageEditor"));
const NotFoundPageEditor = lazy(() => import("@/components/admin/NotFoundPageEditor"));
const PrivacyPageEditor = lazy(() => import("@/components/admin/PrivacyPageEditor"));
const TermsPageEditor = lazy(() => import("@/components/admin/TermsPageEditor"));
const IntegrationsPageEditor = lazy(() => import("@/components/admin/IntegrationsPageEditor"));
const FooterEditor = lazy(() => import("@/components/admin/FooterEditor"));
const SeoEditor = lazy(() => import("@/components/admin/SeoEditor"));
const SitemapRobotsEditor = lazy(() => import("@/components/admin/SitemapRobotsEditor"));
const IntegrationsEditor = lazy(() => import("@/components/admin/IntegrationsEditor"));
const IntegrationsManager = lazy(() => import("@/components/admin/IntegrationsManager"));
const CtaActionsEditor = lazy(() => import("@/components/admin/CtaActionsEditor"));
const SectionRevealsPanel = lazy(() => import("@/components/admin/SectionRevealsPanel"));
const TeamAccessPanel = lazy(() => import("@/components/admin/TeamAccessPanel"));
const PromotionsManager = lazy(() => import("@/components/admin/PromotionsManager"));
const BrandingEditor = lazy(() => import("@/components/admin/BrandingEditor"));
const TestimonialsManager = lazy(() => import("@/components/admin/TestimonialsManager"));
const ClientLogosManager = lazy(() => import("@/components/admin/ClientLogosManager"));
const LeadsManager = lazy(() => import("@/components/admin/LeadsManager"));
const CustomerAccountsManager = lazy(() => import("@/components/admin/CustomerAccountsManager"));
const PricingHighlightsManager = lazy(() => import("@/components/admin/PricingHighlightsManager"));
const FeaturesManager = lazy(() => import("@/components/admin/FeaturesManager"));
const PagesManager = lazy(() => import("@/components/admin/PagesManager"));
const NavigationManager = lazy(() => import("@/components/admin/NavigationManager"));
const AuthButtonsManager = lazy(() => import("@/components/admin/AuthButtonsManager"));
const AuthPagesManager = lazy(() => import("@/components/admin/AuthPagesManager"));
const AdminHelpPanel = lazy(() => import("@/components/admin/AdminHelpPanel"));
const AboutPageEditor = lazy(() => import("@/components/admin/AboutPageEditor"));
const CtaDestinationsAuditPanel = lazy(() => import("@/components/admin/CtaDestinationsAuditPanel"));
const BlockEditor = lazy(() => import("@/components/admin/BlockEditor"));
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeamAccess } from "@/hooks/useTeamAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PostForm = {
  id?: string;
  title: string;
  title_ar: string;
  slug: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  featured_image_url: string;
  category_id: string;
  published: boolean;
};

const emptyPost: PostForm = {
  title: "", title_ar: "", slug: "", excerpt: "", excerpt_ar: "",
  content: "", content_ar: "", featured_image_url: "", category_id: "", published: false,
};

type CategoryForm = { id?: string; name: string; name_ar: string; slug: string; description: string; description_ar: string };
const emptyCategory: CategoryForm = { name: "", name_ar: "", slug: "", description: "", description_ar: "" };

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { isSuperAdmin, can, loading: accessLoading } = useTeamAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"dashboard" | "posts" | "categories" | "content" | "pricing" | "media" | "home" | "seo" | "sitemap" | "integrations" | "integrations_list" | "ctas" | "ctas_audit" | "reveals" | "team" | "promotions" | "branding" | "testimonials" | "client_logos" | "leads" | "customers" | "pricing_highlights" | "features" | "pages" | "navigation" | "auth_buttons" | "auth_pages" | "help" | "page_contact" | "page_product" | "page_pricing" | "page_industries" | "page_features" | "page_blog" | "page_integrations" | "page_404" | "page_privacy" | "page_terms" | "page_about" | "page_footer">("dashboard");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [postForm, setPostForm] = useState<PostForm>(emptyPost);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategory);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);

  // Allow deep-linking into a specific tab via ?tab=features (used by the
  // EditModeBar's "Open in admin" button on /features/<slug>).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t) setTab(t as any);
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const savePost = useMutation({
    mutationFn: async (form: PostForm) => {
      const payload = {
        title: form.title,
        title_ar: form.title_ar || null,
        slug: form.slug,
        excerpt: form.excerpt || null,
        excerpt_ar: form.excerpt_ar || null,
        content: form.content,
        content_ar: form.content_ar || null,
        featured_image_url: form.featured_image_url || null,
        category_id: form.category_id || null,
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
        author_id: user!.id,
      };
      if (form.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setPostDialogOpen(false);
      setPostForm(emptyPost);
      toast({ title: "Post saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const saveCategory = useMutation({
    mutationFn: async (form: CategoryForm) => {
      const payload = {
        name: form.name,
        name_ar: form.name_ar || null,
        slug: form.slug,
        description: form.description || null,
        description_ar: form.description_ar || null,
      };
      if (form.id) {
        const { error } = await supabase.from("blog_categories").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCatDialogOpen(false);
      setCatForm(emptyCategory);
      toast({ title: "Category saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category deleted" });
    },
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-max px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
              <ArrowLeft size={16} /> Site
            </Button>
            <h1 className="text-lg font-bold text-foreground">Site Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground">
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </header>

      <div className="container-max px-4 py-8">
        {/* Top tab navigation (only visible after leaving dashboard) */}
        {tab !== "dashboard" && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab("dashboard")}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} /> Dashboard
            </Button>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-semibold text-foreground capitalize">
              {tab === "content" ? "Site Content (advanced)" : tab === "home" ? "Home Page (advanced)" : tab === "seo" ? "SEO & Meta tags" : tab === "sitemap" ? "Sitemap & robots.txt" : tab === "integrations" ? "Tracking & integrations" : tab === "integrations_list" ? "Integrations page" : tab === "ctas" ? "Buttons & links" : tab === "ctas_audit" ? "Link audit" : tab === "reveals" ? "Section animations" : tab === "team" ? "Team access" : tab === "promotions" ? "Promotions" : tab === "branding" ? "Branding & logos" : tab === "testimonials" ? "Testimonials" : tab === "client_logos" ? "Client logos" : tab === "leads" ? "Leads" : tab === "customers" ? "Customer accounts" : tab === "pricing_highlights" ? "Pricing highlights" : tab === "features" ? "Feature pages" : tab === "auth_pages" ? "Sign in / Sign up pages" : tab === "help" ? "Admin help" : tab === "page_contact" ? "Contact page" : tab === "page_product" ? "Product page" : tab === "page_pricing" ? "Pricing page" : tab === "page_industries" ? "Industries page" : tab === "page_features" ? "Features index page" : tab === "page_blog" ? "Blog page" : tab === "page_integrations" ? "Integrations page" : tab === "page_404" ? "404 page" : tab === "page_privacy" ? "Privacy Policy" : tab === "page_terms" ? "Terms of Service" : tab === "page_about" ? "About page" : tab === "page_footer" ? "Footer" : tab}
            </span>
          </div>
        )}

        {/* Dashboard */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back 👋</h2>
              <p className="text-muted-foreground text-sm">
                Edit your website by clicking text and images directly on the page. No forms.
              </p>
            </div>

            {/* Hero card: visual editor — only for roles that can edit content */}
            {can("visualEditor") && (
              <button
                onClick={() => navigate("/?edit=1")}
                className="group w-full text-start bg-gradient-to-br from-accent to-accent/70 text-accent-foreground rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-accent-foreground/10 rounded-full blur-2xl" />
                <div className="absolute -right-4 -bottom-12 w-48 h-48 bg-accent-foreground/5 rounded-full blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-foreground/15 flex items-center justify-center shrink-0">
                    <Pencil size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="opacity-70" />
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Recommended</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">Edit your website visually</h3>
                    <p className="text-sm md:text-base opacity-90 max-w-lg">
                      Open your site, click any text or image, and change it right there. Switch language with one click. Save when you're done.
                    </p>
                  </div>
                  <ChevronRight size={24} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all hidden md:block" />
                </div>
              </button>
            )}

            {/* Quick action cards — filtered by role capability */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: HelpCircle, title: "Admin help", desc: "Plain-English guides for visual editing, media, industries & more", target: "help" as const, color: "text-accent", show: true },
                { icon: FileBox, title: "Custom pages", desc: "Build new pages with the visual block editor (draft / publish)", target: "pages" as const, color: "text-pink-600", show: can("integrations") },
                { icon: MenuIcon, title: "Navigation", desc: "Manage navbar dropdowns & footer columns", target: "navigation" as const, color: "text-blue-600", show: can("integrations") },
                { icon: LogOut, title: "Auth buttons", desc: "Edit Sign up / Log in label, link, color & visibility", target: "auth_buttons" as const, color: "text-orange-600", show: can("integrations") },
                { icon: FileCode, title: "Sign in / Sign up pages", desc: "Edit text, visuals, brand panel, background & buttons", target: "auth_pages" as const, color: "text-fuchsia-600", show: can("integrations") },
                { icon: Inbox, title: "Leads", desc: "Demo & contact requests from the lead modal", target: "leads" as const, color: "text-indigo-500", show: can("integrations") },
                { icon: Users, title: "Customer accounts", desc: "People who signed up via the public Sign Up form", target: "customers" as const, color: "text-emerald-600", show: isSuperAdmin || isAdmin },
                { icon: Layers, title: "Feature pages", desc: "Cards & /features/:slug pages — edit hero on /features?edit=1", target: "features" as const, color: "text-cyan-600", show: can("integrations") },
                { icon: MessageSquareQuote, title: "Testimonials", desc: "Customer quotes shown on the home page", target: "testimonials" as const, color: "text-sky-500", show: can("media") },
                { icon: Building, title: "Client logos", desc: "Logos in the trust carousel", target: "client_logos" as const, color: "text-slate-500", show: can("media") },
                { icon: Award, title: "Pricing highlights", desc: 'Mark a plan "Most Popular" + override CTAs', target: "pricing_highlights" as const, color: "text-emerald-500", show: can("pricing") },
                { icon: Users, title: "Team access", desc: "Invite teammates & assign roles", target: "team" as const, color: "text-accent", show: isSuperAdmin },
                { icon: Palette, title: "Branding & logos", desc: "Navbar / footer logo, favicon, share image", target: "branding" as const, color: "text-violet-500", show: can("media") },
                { icon: Megaphone, title: "Promotions", desc: "Sales banners, pop-ups & inline promos", target: "promotions" as const, color: "text-rose-500", show: can("promotions") },
                { icon: FolderOpen, title: "Blog posts", desc: `${posts?.length ?? 0} posts`, target: "posts" as const, color: "text-blue-500", show: can("blog") },
                { icon: DollarSign, title: "Pricing", desc: "Plans, features & prices", target: "pricing" as const, color: "text-green-500", show: can("pricing") },
                { icon: MousePointerClick, title: "Buttons & links", desc: "Where every CTA goes (page, email, phone, WhatsApp)", target: "ctas" as const, color: "text-amber-500", show: can("ctas") },
                { icon: AlertTriangle, title: "Link audit", desc: "Scan every CTA / nav link for broken localization or wrong kinds", target: "ctas_audit" as const, color: "text-red-500", show: can("ctas") },
                { icon: Wand2, title: "Section animations", desc: "Pick how each page section reveals on scroll", target: "reveals" as const, color: "text-fuchsia-500", show: can("reveals") },
                { icon: Search, title: "SEO & Meta tags", desc: "Titles, descriptions, keywords, alt text", target: "seo" as const, color: "text-orange-500", show: can("seo") },
                { icon: FileCode, title: "Sitemap & robots", desc: "Auto sitemap.xml & crawler rules", target: "sitemap" as const, color: "text-cyan-500", show: can("sitemap") },
                { icon: Tag, title: "Tracking & integrations", desc: "GA4, GTM, Search Console, pixels", target: "integrations" as const, color: "text-pink-500", show: can("integrations") },
                { icon: Plug, title: "Integrations page", desc: "Partner cards — edit page text on /integrations?edit=1", target: "integrations_list" as const, color: "text-teal-500", show: can("integrations") },
                { icon: ImageIcon, title: "Media library", desc: "Uploaded images", target: "media" as const, color: "text-purple-500", show: can("media") },
              ]
                .filter((c) => c.show)
                .map((card) => (
                <button
                  key={card.target}
                  onClick={() => setTab(card.target)}
                  className="text-start bg-card border border-border rounded-xl p-5 hover:border-accent/50 hover:shadow-md transition-all group"
                >
                  <card.icon size={22} className={`${card.color} mb-3`} />
                  <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                </button>
              ))}

              {/* CTA Analytics — separate route, opens its own page */}
              {can("integrations") && (
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="text-start bg-card border border-border rounded-xl p-5 hover:border-accent/50 hover:shadow-md transition-all group"
                >
                  <MousePointerClick size={22} className="text-indigo-500 mb-3" />
                  <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    CTA Performance
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Top clicked buttons (last 30 days, GA4)</p>
                </button>
              )}

              {can("sitemap") && (
                <button
                  onClick={() => navigate("/admin/sitemap-debug")}
                  className="text-start bg-card border border-border rounded-xl p-5 hover:border-accent/50 hover:shadow-md transition-all group"
                >
                  <FileCode size={22} className="text-cyan-500 mb-3" />
                  <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    Sitemap Debug
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Validate XML parsing and count industry URLs by language</p>
                </button>
              )}
            </div>

            {/* Page editors — every public page has its own form editor */}
            {can("visualEditor") && (
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Page editors</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Edit text, headings, SEO and images for every page. For visual editing, use "Edit your website visually" above.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: "Home page", desc: "Hero, sections, CTA — long form", target: "home" as const },
                    { title: "Product page", desc: "Hero, AI/OCR, why-different copy", target: "page_product" as const },
                    { title: "Pricing page", desc: "Hero, CTA & SEO (plans live in Pricing)", target: "page_pricing" as const },
                    { title: "Industries page", desc: "Hero & CTA copy", target: "page_industries" as const },
                    { title: "Features index page", desc: "Hero copy (cards live in Feature pages)", target: "page_features" as const },
                    { title: "Contact page", desc: "Hero, contact info, form labels", target: "page_contact" as const },
                    { title: "About page", desc: "Hero, story, founder & UAE trust copy", target: "page_about" as const },
                    { title: "Blog page", desc: "Hero & UI labels", target: "page_blog" as const },
                    { title: "Integrations page", desc: "Hero, sections, CTA and search labels", target: "page_integrations" as const },
                    { title: "404 page", desc: "Not-found copy & buttons", target: "page_404" as const },
                    { title: "Privacy Policy", desc: "Full legal body (rich text)", target: "page_privacy" as const },
                    { title: "Terms of Service", desc: "Full legal body (rich text)", target: "page_terms" as const },
                    { title: "Footer", desc: "Columns, social links, copyright", target: "page_footer" as const },
                  ].map((card) => (
                    <button
                      key={card.target}
                      onClick={() => setTab(card.target)}
                      className="text-start bg-card border border-border rounded-xl p-4 hover:border-accent/50 hover:shadow-md transition-all group"
                    >
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">{card.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-border pt-6">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Settings size={12} />
                {showAdvanced ? "Hide" : "Show"} advanced settings
              </button>
              {showAdvanced && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {[
                    { title: "Categories", desc: "Blog post categories", target: "categories" as const },
                    { title: "Home page form editor", desc: "Edit home in a long form (legacy)", target: "home" as const },
                    { title: "Site content table", desc: "Raw key-value editor for everything", target: "content" as const },
                  ].map((card) => (
                    <button
                      key={card.target}
                      onClick={() => setTab(card.target)}
                      className="text-start bg-muted/40 border border-border rounded-lg p-4 hover:bg-muted/60 transition-colors"
                    >
                      <h5 className="text-sm font-semibold text-foreground">{card.title}</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{card.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Blog Posts</h2>
              <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={() => setPostForm(emptyPost)}>
                    <Plus size={16} /> New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{postForm.id ? "Edit Post" : "New Post"}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => { e.preventDefault(); savePost.mutate(postForm); }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Title (EN) *</label>
                        <Input value={postForm.title} onChange={(e) => { setPostForm({ ...postForm, title: e.target.value, slug: postForm.id ? postForm.slug : generateSlug(e.target.value) }); }} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Title (AR)</label>
                        <Input value={postForm.title_ar} onChange={(e) => setPostForm({ ...postForm, title_ar: e.target.value })} dir="rtl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Slug *</label>
                      <Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Excerpt (EN)</label>
                        <Textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Excerpt (AR)</label>
                        <Textarea value={postForm.excerpt_ar} onChange={(e) => setPostForm({ ...postForm, excerpt_ar: e.target.value })} rows={2} dir="rtl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Content (EN) * — use "/" for slash commands, drag blocks to reorder</label>
                      <Suspense fallback={<Textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={8} required />}>
                        <BlockEditor
                          value={postForm.content}
                          onChange={(html) => setPostForm((prev) => ({ ...prev, content: html }))}
                          placeholder="Start writing... Type '/' for block menu"
                        />
                      </Suspense>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Content (AR)</label>
                      <Suspense fallback={<Textarea value={postForm.content_ar} onChange={(e) => setPostForm({ ...postForm, content_ar: e.target.value })} rows={8} dir="rtl" />}>
                        <BlockEditor
                          value={postForm.content_ar}
                          onChange={(html) => setPostForm((prev) => ({ ...prev, content_ar: html }))}
                          placeholder="ابدأ بالكتابة..."
                          dir="rtl"
                        />
                      </Suspense>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Featured Image (header)</label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Shown at the top of the post and as the social share preview.
                      </p>
                      {postForm.featured_image_url ? (
                        <div className="relative inline-block mb-2 rounded-lg overflow-hidden border border-border">
                          <img
                            src={postForm.featured_image_url}
                            alt="Featured preview"
                            className="max-h-48 max-w-full object-contain bg-muted/30"
                          />
                          <button
                            type="button"
                            onClick={() => setPostForm({ ...postForm, featured_image_url: "" })}
                            className="absolute top-1.5 right-1.5 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 shadow"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-2 bg-muted/20">
                          <ImageIcon size={28} className="mx-auto mb-2 text-muted-foreground/40" />
                          <p className="text-xs text-muted-foreground">No featured image yet</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFeaturedPickerOpen(true)}
                          className="gap-1"
                        >
                          <ImagePlus size={14} />
                          {postForm.featured_image_url ? "Change image" : "Choose from library"}
                        </Button>
                        <Input
                          value={postForm.featured_image_url}
                          onChange={(e) => setPostForm({ ...postForm, featured_image_url: e.target.value })}
                          placeholder="...or paste URL"
                          className="flex-1 min-w-[200px] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <select
                        value={postForm.category_id}
                        onChange={(e) => setPostForm({ ...postForm, category_id: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No category</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      {postForm.published ? (
                        <>
                          <Eye size={14} className="text-green-500" />
                          <span className="text-sm font-medium">Currently published — visible on the public blog</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Currently a draft — only visible to admins</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-1"
                        disabled={savePost.isPending}
                        onClick={() => {
                          const draft = { ...postForm, published: false };
                          setPostForm(draft);
                          savePost.mutate(draft);
                        }}
                      >
                        <EyeOff size={14} />
                        {savePost.isPending ? "Saving..." : "Save as draft"}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                        disabled={savePost.isPending}
                        onClick={() => setPostForm((prev) => ({ ...prev, published: true }))}
                      >
                        <Eye size={14} />
                        {savePost.isPending ? "Saving..." : postForm.id && postForm.published ? "Update published post" : "Save & publish"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <MediaPicker
                open={featuredPickerOpen}
                onOpenChange={setFeaturedPickerOpen}
                onSelect={(url) => setPostForm((prev) => ({ ...prev, featured_image_url: url }))}
                uploadFolder="blog"
                title="Choose featured image"
              />
            </div>

            <div className="space-y-3">
              {posts?.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.published ? (
                        <Eye size={14} className="text-green-500" />
                      ) : (
                        <EyeOff size={14} className="text-muted-foreground" />
                      )}
                      <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.blog_categories?.name ?? "No category"} · {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPostForm({
                          id: post.id,
                          title: post.title,
                          title_ar: post.title_ar ?? "",
                          slug: post.slug,
                          excerpt: post.excerpt ?? "",
                          excerpt_ar: post.excerpt_ar ?? "",
                          content: post.content,
                          content_ar: post.content_ar ?? "",
                          featured_image_url: post.featured_image_url ?? "",
                          category_id: post.category_id ?? "",
                          published: post.published,
                        });
                        setPostDialogOpen(true);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deletePost.mutate(post.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {(!posts || posts.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No posts yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Categories</h2>
              <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={() => setCatForm(emptyCategory)}>
                    <Plus size={16} /> New Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{catForm.id ? "Edit Category" : "New Category"}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => { e.preventDefault(); saveCategory.mutate(catForm); }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name (EN) *</label>
                        <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: catForm.id ? catForm.slug : generateSlug(e.target.value) })} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name (AR)</label>
                        <Input value={catForm.name_ar} onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })} dir="rtl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Slug *</label>
                      <Input value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description (EN)</label>
                        <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description (AR)</label>
                        <Textarea value={catForm.description_ar} onChange={(e) => setCatForm({ ...catForm, description_ar: e.target.value })} rows={2} dir="rtl" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={saveCategory.isPending}>
                      {saveCategory.isPending ? "Saving..." : "Save Category"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCatForm({
                          id: cat.id,
                          name: cat.name,
                          name_ar: cat.name_ar ?? "",
                          slug: cat.slug,
                          description: cat.description ?? "",
                          description_ar: cat.description_ar ?? "",
                        });
                        setCatDialogOpen(true);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCategory.mutate(cat.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {(!categories || categories.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No categories yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading editor…</div>}>
        {/* Site Content Tab */}
        {tab === "content" && <SiteContentManager />}

        {/* Pricing Tab */}
        {tab === "pricing" && <PricingEditor />}

        {/* Home Tab */}
        {tab === "home" && <HomePageEditor />}

        {/* Media Library Tab */}
        {tab === "media" && <MediaLibrary />}

        {/* SEO Tab */}
        {tab === "seo" && <SeoEditor />}

        {/* Sitemap & robots.txt */}
        {tab === "sitemap" && <SitemapRobotsEditor />}

        {/* Tracking & integrations */}
        {tab === "integrations" && <IntegrationsEditor />}

        {/* Integrations page (cards) */}
        {tab === "integrations_list" && <IntegrationsManager />}

        {/* CTA buttons & links */}
        {tab === "ctas" && <CtaActionsEditor />}

        {/* CTA / link audit */}
        {tab === "ctas_audit" && <CtaDestinationsAuditPanel />}

        {/* Section reveal animations */}
        {tab === "reveals" && <SectionRevealsPanel />}

        {/* Promotions */}
        {tab === "promotions" && <PromotionsManager />}

        {/* Branding & logos */}
        {tab === "branding" && <BrandingEditor />}

        {/* Trust + conversion managers */}
        {tab === "testimonials" && <TestimonialsManager />}
        {tab === "client_logos" && <ClientLogosManager />}
        {tab === "leads" && <LeadsManager />}
        {tab === "customers" && <CustomerAccountsManager />}
        {tab === "pricing_highlights" && <PricingHighlightsManager />}
        {tab === "features" && <FeaturesManager />}

        {tab === "pages" && <PagesManager />}
        {tab === "navigation" && <NavigationManager />}
        {tab === "auth_buttons" && <AuthButtonsManager />}
        {tab === "auth_pages" && <AuthPagesManager />}
        {tab === "help" && <AdminHelpPanel />}

        {/* Per-page editors */}
        {tab === "page_contact" && <ContactPageEditor />}
        {tab === "page_product" && <ProductPageEditor />}
        {tab === "page_pricing" && <PricingPageEditor />}
        {tab === "page_industries" && <IndustriesPageEditor />}
        {tab === "page_features" && <FeaturesPageEditor />}
        {tab === "page_blog" && <BlogPageEditor />}
        {tab === "page_integrations" && <IntegrationsPageEditor />}
        {tab === "page_404" && <NotFoundPageEditor />}
        {tab === "page_privacy" && <PrivacyPageEditor />}
        {tab === "page_terms" && <TermsPageEditor />}
        {tab === "page_footer" && <FooterEditor />}
        {tab === "page_about" && <AboutPageEditor />}

        {/* Team access — super-admin only */}
        {tab === "team" && (
          isSuperAdmin ? (
            <TeamAccessPanel />
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Only the super admin can manage team access.
            </div>
          )
        )}
        </Suspense>
      </div>
    </div>
  );
};

export default Admin;
