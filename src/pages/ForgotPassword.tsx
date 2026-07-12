import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

const ForgotPassword = () => {
  const { lang, isRTL } = useLanguage();
  const { user, isCustomer, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);

  if (!loading && user && isCustomer && !isAdmin) {
    return <Navigate to={localizeInternalPath("/", lang)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const cleanEmail = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}${localizeInternalPath("/reset-password", lang)}`,
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: l("Could not send email", "تعذّر إرسال البريد"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSent(true);
  };

  return (
    <>
      <SEOHead
        title={l("Forgot password — Digitize me", "نسيت كلمة المرور — Digitize me")}
        description={l("Reset your Digitize me password.", "إعادة تعيين كلمة مرور Digitize me.")}
        path="/forgot-password"
        pageKey="forgot-password"
      />
      <AuthShell
        title={sent ? l("Check your inbox", "تحقق من بريدك") : l("Forgot password?", "نسيت كلمة المرور؟")}
        subtitle={
          sent
            ? l("We sent you a reset link.", "أرسلنا لك رابط إعادة التعيين.")
            : l("Enter your email and we'll send you a reset link.", "أدخل بريدك وسنرسل لك رابطًا لإعادة التعيين.")
        }
        footer={
          <Link
            to={localizeInternalPath("/signin", lang)}
            className="inline-flex items-center gap-1.5 text-accent hover:underline font-semibold"
          >
            <ArrowLeft size={14} className={isRTL ? "rotate-180" : ""} />
            {l("Back to log in", "العودة لتسجيل الدخول")}
          </Link>
        }
      >
        {sent ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              {l("Reset link sent to:", "تم إرسال الرابط إلى:")}
            </p>
            <p className="mt-1 text-sm font-mono text-foreground break-all">{email}</p>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              {l(
                "Click the link in the email to set a new password. Didn't get it? Check your spam folder.",
                "اضغط على الرابط في البريد لتعيين كلمة مرور جديدة. لم يصل؟ تحقق من مجلد الرسائل غير المرغوب فيها.",
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-xs text-accent hover:underline font-medium"
            >
              {l("Send again", "أعد الإرسال")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                {l("Email", "البريد الإلكتروني")}
              </Label>
              <div className="relative mt-1.5">
                <Mail
                  size={16}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
                />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`h-11 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold"
              disabled={submitting}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : l("Send reset link", "إرسال رابط إعادة التعيين")}
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
};

export default ForgotPassword;
