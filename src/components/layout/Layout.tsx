import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "@/i18n/LanguageContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isRTL } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      {/* Skip-to-content link — invisible until focused via keyboard */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {isRTL ? "تخطي إلى المحتوى" : "Skip to main content"}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pt-20 md:pt-24 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

