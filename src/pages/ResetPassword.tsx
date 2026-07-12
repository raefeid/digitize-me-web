import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

/**
 * Reached via the recovery link in the password-reset email.
 * Supabase parses the URL hash automatically and creates a recovery session.
 * We listen for the PASSWORD_RECOVERY event before letting the user
 * pick a new password.
 */
const ResetPassword = () => {
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [done, setDone] = useState(false);

  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      }
    });

    // If the user already has a session (e.g. opened the link and Supabase set it),
    // unlock the form. If neither hash nor session exists, mark the link invalid.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else if (!window.location.hash.includes("access_token")) {
        setLinkInvalid(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 6) {
      toast({
        title: l("Password too short", "كلمة المرور قصيرة"),
        description: l("Use at least 6 characters.", "استخدم ٦ أحرف على الأقل."),
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: l("Passwords don't match", "كلمتا المرور غير متطابقتين"),
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({
        title: l("Could not update password", "تعذّر تحديث كلمة المرور"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setDone(true);
    setTimeout(() => navigate(localizeInternalPath("/", lang)), 2000);
  };

  return (
    <>
      <SEOHead
        title={l("Reset password — Digitize me", "إعادة تعيين كلمة المرور — Digitize me")}
        description={l("Set a new password for your Digitize me account.", "عيّن كلمة مرور جديدة لحسابك.")}
        path="/reset-password"
        pageKey="reset-password"
      />
      <AuthShell
        title={done ? l("Password updated", "تم تحديث كلمة المرور") : l("Set a new password", "تعيين كلمة مرور جديدة")}
        subtitle={
          done
            ? l("Redirecting you now…", "جارٍ تحويلك الآن…")
            : l("Choose a strong password you'll remember.", "اختر كلمة مرور قوية يمكنك تذكرها.")
        }
      >
        {linkInvalid ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              {l("This reset link is invalid or has expired.", "رابط إعادة التعيين غير صالح أو انتهت صلاحيته.")}
            </p>
            <Button asChild className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              <Link to={localizeInternalPath("/forgot-password", lang)}>
                {l("Request a new link", "اطلب رابطًا جديدًا")}
              </Link>
            </Button>
          </div>
        ) : done ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
            <p className="mt-4 text-sm font-semibold text-foreground">
              {l("All set! You're signed in.", "تم! لقد سجّلت الدخول.")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                {l("New password", "كلمة المرور الجديدة")}
              </Label>
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
                  placeholder="••••••••"
                  className={`h-11 ${isRTL ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                  autoComplete="new-password"
                  disabled={submitting || !sessionReady}
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

            <div>
              <Label htmlFor="confirm" className="text-sm font-medium">
                {l("Confirm new password", "تأكيد كلمة المرور")}
              </Label>
              <div className="relative mt-1.5">
                <Lock
                  size={16}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`}
                />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`h-11 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                  autoComplete="new-password"
                  disabled={submitting || !sessionReady}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold mt-2"
              disabled={submitting || !sessionReady}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : !sessionReady ? (
                l("Verifying link…", "جارٍ التحقق من الرابط…")
              ) : (
                l("Update password", "تحديث كلمة المرور")
              )}
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
};

export default ResetPassword;
