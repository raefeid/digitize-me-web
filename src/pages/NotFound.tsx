import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/cms/EditableText";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

/**
 * 404 page.
 *
 * SEO notes:
 * - Emits `noindex, nofollow` so search engines don't index dead URLs.
 * - Sets a clear title/description for the rare crawler that does fetch it.
 * - Uses the site Layout so the user still gets nav + footer to recover.
 *
 * All visible copy is inline-editable via the CMS (page="not_found").
 */
const NotFound = () => {
  const location = useLocation();
  const { isRTL, lang } = useLanguage();

  useEffect(() => {
    // Helpful for noticing real 404 patterns in production logs without
    // wiring a full analytics event for it.
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Helmet>
        <title>Page not found (404) — Digitize me</title>
        <meta
          name="description"
          content="Sorry, the page you were looking for doesn't exist. Browse our products, industries, or pricing."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
        <p className="text-7xl md:text-9xl font-bold gradient-text mb-4">404</p>
        <EditableText
          as="h1"
          page="not_found"
          section="hero"
          contentKey="title"
          fallback={isRTL ? "الصفحة غير موجودة" : "Page not found"}
          className="text-3xl md:text-4xl font-bold text-foreground mb-4 block"
        />
        <EditableText
          as="p"
          page="not_found"
          section="hero"
          contentKey="description"
          multiline
          fallback={
            isRTL
              ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. جرّب أحد الروابط أدناه."
              : "The page you were looking for doesn't exist or has moved. Try one of the links below."
          }
          className="text-muted-foreground max-w-md mb-8 block"
        />
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <Link to={localizeInternalPath("/", lang)}>
              <Home className="mr-2 h-4 w-4" />
              <EditableText
                page="not_found"
                section="cta"
                contentKey="back_home_label"
                fallback={isRTL ? "العودة إلى الرئيسية" : "Back to home"}
              />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <EditableText
              page="not_found"
              section="cta"
              contentKey="go_back_label"
              fallback={isRTL ? "رجوع" : "Go back"}
            />
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link to={localizeInternalPath("/contact", lang)}>
              <EditableText
                page="not_found"
                section="cta"
                contentKey="contact_support_label"
                fallback={isRTL ? "تواصل مع الدعم" : "Contact support"}
              />
            </Link>
          </Button>
        </div>
      </div>
      <CustomBlocksRenderer page="not_found" />
      <AddBlockButton page="not_found" />
    </Layout>
  );
};

export default NotFound;
