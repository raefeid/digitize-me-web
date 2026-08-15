import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import EditableText from "@/components/cms/EditableText";
import { cn } from "@/lib/utils";

interface UAEHostingBadgeProps {
  variant?: "default" | "subtle" | "footer";
  className?: string;
}

/**
 * Site-wide trust badge reinforcing UAE data residency & regional presence.
 * Label is editable via CMS (page="site", section="trust", key="uae_hosting_label").
 */
const UAEHostingBadge = ({ variant = "default", className = "" }: UAEHostingBadgeProps) => {
  const { isRTL } = useLanguage();
  const fallback = isRTL
    ? "🇦🇪🇸🇦 مستضاف في الإمارات والسعودية • بيانات إقليمية"
    : "🇦🇪🇸🇦 Hosted in the UAE & KSA • Regional data residency";

  const base =
    "inline-flex items-center gap-2 rounded-full text-xs font-medium whitespace-nowrap";
  const styles =
    variant === "footer"
      ? "px-3 py-1.5 bg-primary-foreground/10 text-primary-foreground/80 border border-primary-foreground/15"
      : variant === "subtle"
        ? "px-3 py-1.5 bg-muted text-muted-foreground border border-border"
        : "px-3 py-1.5 bg-accent/10 text-accent border border-accent/20";

  return (
    <span className={cn(base, styles, className)}>
      <ShieldCheck size={14} className="shrink-0" />
      <EditableText
        page="site"
        section="trust"
        contentKey="uae_hosting_label"
        fallback={fallback}
      />
    </span>
  );
};

export default UAEHostingBadge;
