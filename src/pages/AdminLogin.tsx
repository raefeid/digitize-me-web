import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = forwardRef<HTMLDivElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect as soon as auth confirms admin status
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setSubmitting(false);
    }
    // Don't setSubmitting(false) on success — keep spinner until useEffect redirects
  };

  // Show spinner while auth is loading or after successful login waiting for redirect
  if (authLoading || (submitting && !isAdmin)) {
    // Only show full-page spinner after form submission, not on initial load
  }

  return (
    <div ref={ref} className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" disabled={submitting} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} disabled={submitting} />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Signing in...</> : "Sign in"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
});

AdminLogin.displayName = "AdminLogin";

export default AdminLogin;
