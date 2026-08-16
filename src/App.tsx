import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { RevealRegistryProvider } from "@/hooks/useSectionReveals";
import EditModeBar from "@/components/cms/EditModeBar";
import FormatToolbar from "@/components/cms/FormatToolbar";
import { PromotionsHost } from "@/components/promotions/PromotionsHost";
import { GeoProvider } from "@/hooks/useGeoLocation";
import { CookieConsentProvider } from "@/hooks/useCookieConsent";
import { Suspense, lazy, useLayoutEffect } from "react";
import LaunchOverlay from "@/components/transitions/LaunchOverlay";
import CookieConsentBanner from "@/components/consent/CookieConsentBanner";

const queryClient = new QueryClient();

const Index = lazy(() => import("./pages/Index.tsx"));
const Product = lazy(() => import("./pages/Product.tsx"));
const Industries = lazy(() => import("./pages/Industries.tsx"));
const IndustryDetail = lazy(() => import("./pages/Industries.tsx").then((m) => ({ default: m.IndustryDetail })));

const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics.tsx"));
const AdminSitemapDebug = lazy(() => import("./pages/AdminSitemapDebug.tsx"));
const FeatureDetail = lazy(() => import("./pages/FeatureDetail.tsx"));
const Features = lazy(() => import("./pages/Features.tsx"));
const CustomPage = lazy(() => import("./pages/CustomPage.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Partners = lazy(() => import("./pages/Partners.tsx"));

import { useTrackingScripts } from "@/hooks/useTrackingScripts";
import SiteChatbot from "@/components/chatbot/SiteChatbot";

const ChatbotMount = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <SiteChatbot />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};


const TrackingLoader = () => {
  useTrackingScripts();
  return null;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <TrackingLoader />
    <PromotionsHost />
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/ar" element={<Index />} />
        <Route path="/product" element={<Product />} />
        <Route path="/ar/product" element={<Product />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/ar/industries" element={<Industries />} />
        <Route path="/industries/:slug" element={<IndustryDetail />} />
        <Route path="/ar/industries/:slug" element={<IndustryDetail />} />
        
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/ar/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ar/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/ar/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/sitemap-debug" element={<AdminSitemapDebug />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/:slug" element={<FeatureDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/ar/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ar/reset-password" element={<ResetPassword />} />
        <Route path="/:slug" element={<CustomPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <EditModeBar />
    <FormatToolbar />
    <ChatbotMount />
    <LaunchOverlay />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <GeoProvider>
          <AuthProvider>
            <EditModeProvider>
              <RevealRegistryProvider>
              <TooltipProvider>
                <CookieConsentProvider>
                  <Toaster />
                  <Sonner />
                  <AppRoutes />
                  <CookieConsentBanner />
                </CookieConsentProvider>
              </TooltipProvider>
              </RevealRegistryProvider>
            </EditModeProvider>
          </AuthProvider>
          </GeoProvider>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
