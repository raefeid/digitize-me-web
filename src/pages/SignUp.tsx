import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SEOHead from "@/components/SEOHead";
import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { useAuthPageContent } from "@/hooks/useAuthPageContent";
import { submitClasses, submitStyle, submitHoverHandlers } from "@/components/auth/submit-style";


const SignUp = () => {
  const { lang, isRTL } = useLanguage();
  const { user, isCustomer, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: content } = useAuthPageContent("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const pick = (en?: string | null, ar?: string | null, fallback?: string) =>
    (isRTL ? ar : en) || fallback || "";

  if (!loading && user && isCustomer && !isAdmin) {
    return <Navigate to={localizeInternalPath("/", lang)} replace />;
  }

  const passScore = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", l("Too short", "قصيرة جدًا"), l("Weak", "ضعيفة"), l("Okay", "مقبولة"), l("Strong", "قوية"), l("Excellent", "ممتازة")][passScore];
  const strengthColor = ["bg-muted", "bg-destructive", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"][passScore];

  const showTerms = content?.show_terms_checkbox !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (showTerms && !agreed) {
      toast({
        title: l("Please accept the terms", "الرجاء قبول الشروط"),
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: l("Password too short", "كلمة المرور قصيرة"),
        description: l("Use at least 6 characters.", "استخدم ٦ أحرف على الأقل."),
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const cleanEmail = email.trim();
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${localizeInternalPath("/", lang)}`,
        data: { full_name: fullName.trim() },
      },
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: l("Sign up failed", "فشل إنشاء الحساب"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSentTo(cleanEmail);
  };

  const title = pick(content?.title, content?.title_ar, l("Create your account", "أنشئ حسابك"));
  const subtitle = pick(content?.subtitle, content?.subtitle_ar, l("Start organizing documents with AI in minutes.", "ابدأ تنظيم مستنداتك بالذكاء الاصطناعي في دقائق."));
  const fullNameLabel = pick(content?.full_name_label, content?.full_name_label_ar, l("Full name", "الاسم الكامل"));
  const fullNamePh = pick(content?.full_name_placeholder, content?.full_name_placeholder_ar, l("Jane Doe", "اسمك الكامل"));
  const emailLabel = pick(content?.email_label, content?.email_label_ar, l("Work email", "البريد الإلكتروني للعمل"));
  const emailPh = pick(content?.email_placeholder, content?.email_placeholder_ar, "you@company.com");
  const passLabel = pick(content?.password_label, content?.password_label_ar, l("Password", "كلمة المرور"));
  const passPh = pick(content?.password_placeholder, content?.password_placeholder_ar, "••••••••");
  const dividerText = pick(content?.divider_text, content?.divider_text_ar, l("or", "أو"));
  const submitLabel = pick(content?.submit_label, content?.submit_label_ar, l("Create account", "إنشاء الحساب"));
  const loadingLabel = pick(content?.submit_loading_label, content?.submit_loading_label_ar);
  const googleLabel = pick(content?.google_label, content?.google_label_ar, l("Sign up with Google", "إنشاء حساب بـ Google"));
  const termsText = pick(content?.terms_text, content?.terms_text_ar);
  const footerPrefix = pick(content?.footer_prefix, content?.footer_prefix_ar, l("Already have an account?", "لديك حساب بالفعل؟"));
  const footerLink = pick(content?.footer_link_label, content?.footer_link_label_ar, l("Log in", "تسجيل الدخول"));
  const footerUrl = content?.footer_link_url || "/signin";

  const btnClass = submitClasses(content);
  const btnStyle = submitStyle(content);
  const btnHover = submitHoverHandlers(content);

  // Confirmation success state
  if (sentTo) {
    return (
      <>
        <SEOHead
          title={l("Check your email — Digitize me", "تحقق من بريدك — Digitize me")}
          description={l("Verify your email to activate your account.", "أكّد بريدك لتفعيل حسابك.")}
          path="/signup"
          pageKey="signup"
        />
        <AuthShell
          title={l("Almost there!", "اقتربت!")}
          subtitle={l("Check your inbox to verify your account.", "تحقق من بريدك لتأكيد حسابك.")}
          content={content}
          footer={
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="text-accent hover:underline font-semibold"
            >
              {l("Use a different email", "استخدم بريدًا آخر")}
            </button>
          }
        >
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              {l("We sent a verification link to:", "أرسلنا رابط تأكيد إلى:")}
            </p>
            <p className="mt-1 text-sm font-mono text-foreground break-all">{sentTo}</p>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              {l(
                "Click the link in the email to activate your account, then come back to sign in. The link expires in 24 hours.",
                "اضغط على الرابط في البريد لتفعيل حسابك، ثم عُد لتسجيل الدخول. تنتهي صلاحية الرابط خلال 24 ساعة.",
              )}
            </p>
          </div>
          <Button
            asChild
            className="w-full h-11 mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold"
          >
            <Link to={localizeInternalPath("/signin", lang)}>
              {l("Go to log in", "اذهب لتسجيل الدخول")}
            </Link>
          </Button>
        </AuthShell>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={l("Sign up — Digitize me", "إنشاء حساب — Digitize me")}
        description={l(
          "Create your Digitize me account to manage Arabic & English documents with AI-powered OCR.",
          "أنشئ حسابك في Digitize me لإدارة المستندات بالعربية والإنجليزية مع OCR بالذكاء الاصطناعي.",
        )}
        path="/signup"
        pageKey="signup"
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
              errorTitle={l("Google sign-up failed", "فشل إنشاء الحساب عبر Google")}
            />
            <div className="my-6 flex items-center gap-3">
              <span className="flex-1 h-px bg-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{dividerText}</span>
              <span className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium">{fullNameLabel}</Label>
            <div className="relative mt-1.5">
              <UserIcon
                size={16}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
              />
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={fullNamePh}
                className={`h-11 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                autoComplete="name"
                disabled={submitting}
              />
            </div>
          </div>

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
            <Label htmlFor="password" className="text-sm font-medium">{passLabel}</Label>
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passPh}
                className={`h-11 ${isRTL ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                autoComplete="new-password"
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
            {password.length > 0 && (
              <div className="mt-2">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${(passScore / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{strengthLabel}</p>
              </div>
            )}
            {password.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {l("At least 6 characters.", "٦ أحرف على الأقل.")}
              </p>
            )}
          </div>

          {showTerms && (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c === true)}
                disabled={submitting}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                {termsText || (
                  <>
                    {l("I agree to the", "أوافق على")}{" "}
                    <Link to={localizeInternalPath("/terms", lang)} className="text-accent hover:underline" target="_blank">
                      {l("Terms of Service", "شروط الخدمة")}
                    </Link>{" "}
                    {l("and", "و")}{" "}
                    <Link to={localizeInternalPath("/privacy", lang)} className="text-accent hover:underline" target="_blank">
                      {l("Privacy Policy", "سياسة الخصوصية")}
                    </Link>
                    .
                  </>
                )}
              </span>
            </label>
          )}

          <Button
            type="submit"
            className={btnClass}
            style={btnStyle}
            disabled={submitting || (showTerms && !agreed)}
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

export default SignUp;
