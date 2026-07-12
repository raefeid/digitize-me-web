import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { useAuthPageContent } from "@/hooks/useAuthPageContent";
import { submitClasses, submitStyle, submitHoverHandlers } from "@/components/auth/submit-style";


const SignIn = () => {
  const { lang, isRTL } = useLanguage();
  const { signIn, user, isCustomer, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: content } = useAuthPageContent("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const pick = (en?: string | null, ar?: string | null, fallback?: string) =>
    (isRTL ? ar : en) || fallback || "";

  if (!loading && user && isCustomer && !isAdmin) {
    return <Navigate to={localizeInternalPath("/", lang)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast({
        title: l("Sign in failed", "فشل تسجيل الدخول"),
        description:
          error.message === "Invalid login credentials"
            ? l("Email or password is incorrect.", "البريد الإلكتروني أو كلمة المرور غير صحيحة.")
            : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: l("Welcome back", "مرحبًا بعودتك") });
    navigate(localizeInternalPath("/", lang));
  };

  const title = pick(content?.title, content?.title_ar, l("Welcome back", "مرحبًا بعودتك"));
  const subtitle = pick(content?.subtitle, content?.subtitle_ar, l("Log in to continue to your workspace.", "سجّل الدخول للمتابعة إلى مساحة العمل."));
  const emailLabel = pick(content?.email_label, content?.email_label_ar, l("Email", "البريد الإلكتروني"));
  const emailPh = pick(content?.email_placeholder, content?.email_placeholder_ar, "you@company.com");
  const passLabel = pick(content?.password_label, content?.password_label_ar, l("Password", "كلمة المرور"));
  const passPh = pick(content?.password_placeholder, content?.password_placeholder_ar, "••••••••");
  const forgotLabel = pick(content?.forgot_link_label, content?.forgot_link_label_ar, l("Forgot password?", "نسيت كلمة المرور؟"));
  const dividerText = pick(content?.divider_text, content?.divider_text_ar, l("or", "أو"));
  const submitLabel = pick(content?.submit_label, content?.submit_label_ar, l("Log in", "تسجيل الدخول"));
  const loadingLabel = pick(content?.submit_loading_label, content?.submit_loading_label_ar);
  const googleLabel = pick(content?.google_label, content?.google_label_ar, l("Continue with Google", "المتابعة بحساب Google"));
  const footerPrefix = pick(content?.footer_prefix, content?.footer_prefix_ar, l("Don't have an account?", "ليس لديك حساب؟"));
  const footerLink = pick(content?.footer_link_label, content?.footer_link_label_ar, l("Create one", "أنشئ حسابك"));
  const footerUrl = content?.footer_link_url || "/signup";

  const btnClass = submitClasses(content);
  const btnStyle = submitStyle(content);
  const btnHover = submitHoverHandlers(content);

  return (
    <>
      <SEOHead
        title={l("Log in — Digitize me", "تسجيل الدخول — Digitize me")}
        description={l(
          "Log in to your Digitize me account to manage Arabic & English documents.",
          "سجّل الدخول إلى حسابك في Digitize me لإدارة المستندات بالعربية والإنجليزية.",
        )}
        path="/signin"
        pageKey="signin"
      />
      <AuthShell
        title={title}
        subtitle={subtitle}
        content={content}
        footer={
          content?.footer_link_enabled !== false ? (
            <>
              {footerPrefix}{" "}
              <Link
                to={localizeInternalPath(footerUrl, lang)}
                className="text-accent hover:underline font-semibold"
              >
                {footerLink}
              </Link>
            </>
          ) : null
        }
      >
        {content?.google_enabled !== false && (
          <>
            <GoogleButton
              label={googleLabel}
              errorTitle={l("Google sign-in failed", "فشل تسجيل الدخول عبر Google")}
            />
            <div className="my-6 flex items-center gap-3">
              <span className="flex-1 h-px bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {dividerText}
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
          <div>
            <Label htmlFor="email" className="text-sm font-medium">{emailLabel}</Label>
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
                placeholder={emailPh}
                className={`h-11 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                autoComplete="email"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">{passLabel}</Label>
              {content?.forgot_link_enabled !== false && (
                <Link
                  to={localizeInternalPath("/forgot-password", lang)}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  {forgotLabel}
                </Link>
              )}
            </div>
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passPh}
                className={`h-11 ${isRTL ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "left-3" : "right-3"}`}
                aria-label={showPassword ? l("Hide password", "إخفاء كلمة المرور") : l("Show password", "عرض كلمة المرور")}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className={btnClass}
            style={btnStyle}
            disabled={submitting}
            {...btnHover}
          >
            {submitting ? (
              loadingLabel ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {loadingLabel}
                </span>
              ) : (
                <Loader2 size={16} className="animate-spin" />
              )
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default SignIn;
