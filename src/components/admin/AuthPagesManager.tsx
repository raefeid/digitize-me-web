import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, ImageIcon } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import type { AuthBenefit, AuthPageContent } from "@/hooks/useAuthPageContent";

const variants = [
  { value: "default", label: "Primary (filled)" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost (text only)" },
  { value: "secondary", label: "Secondary" },
  { value: "accent", label: "Accent" },
];

const iconOptions = ["Zap", "Globe2", "ShieldCheck", "Sparkles", "Lock", "User", "Mail", "Star", "CheckCircle2", "Award"];

type Draft = AuthPageContent;

const PageEditor = ({ pageKey }: { pageKey: "signin" | "signup" }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [illustrationPickerOpen, setIllustrationPickerOpen] = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-auth-page", pageKey],
    queryFn: async (): Promise<AuthPageContent> => {
      const { data, error } = await supabase
        .from("auth_pages")
        .select("*")
        .eq("page_key", pageKey)
        .single();
      if (error) throw error;
      return {
        ...data,
        brand_benefits: Array.isArray(data.brand_benefits)
          ? (data.brand_benefits as AuthBenefit[])
          : [],
        brand_benefits_ar: Array.isArray(data.brand_benefits_ar)
          ? (data.brand_benefits_ar as AuthBenefit[])
          : [],
      } as AuthPageContent;
    },
  });

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (isLoading || !draft) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={16} /> Loading…
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft({ ...draft, [key]: value });

  const setBenefit = (lang: "en" | "ar", idx: number, patch: Partial<AuthBenefit>) => {
    const field = lang === "en" ? "brand_benefits" : "brand_benefits_ar";
    const list = [...(draft[field] as AuthBenefit[])];
    list[idx] = { ...list[idx], ...patch };
    set(field, list as any);
  };

  const addBenefit = (lang: "en" | "ar") => {
    const field = lang === "en" ? "brand_benefits" : "brand_benefits_ar";
    set(field, [...(draft[field] as AuthBenefit[]), { icon: "Sparkles", title: "", desc: "" }] as any);
  };

  const removeBenefit = (lang: "en" | "ar", idx: number) => {
    const field = lang === "en" ? "brand_benefits" : "brand_benefits_ar";
    const list = (draft[field] as AuthBenefit[]).filter((_, i) => i !== idx);
    set(field, list as any);
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, created_at, updated_at, page_key, ...payload } = draft as any;
    const { error } = await supabase
      .from("auth_pages")
      .update(payload)
      .eq("id", draft.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: `${pageKey === "signin" ? "Sign in" : "Sign up"} page updated.` });
    qc.invalidateQueries({ queryKey: ["admin-auth-page", pageKey] });
    qc.invalidateQueries({ queryKey: ["auth-page-content", pageKey] });
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  const Bilingual = ({
    label,
    enKey,
    arKey,
    placeholder,
    multiline,
  }: {
    label: string;
    enKey: keyof Draft;
    arKey: keyof Draft;
    placeholder?: string;
    multiline?: boolean;
  }) => {
    const Comp: any = multiline ? Textarea : Input;
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={`${label} (EN)`}>
          <Comp
            value={(draft[enKey] as string) ?? ""}
            onChange={(e: any) => set(enKey, e.target.value)}
            placeholder={placeholder}
            rows={multiline ? 2 : undefined}
          />
        </Field>
        <Field label={`${label} (AR)`}>
          <Comp
            dir="rtl"
            value={(draft[arKey] as string) ?? ""}
            onChange={(e: any) => set(arKey, e.target.value)}
            placeholder={placeholder}
            rows={multiline ? 2 : undefined}
          />
        </Field>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["text"]} className="space-y-3">
        {/* Page text */}
        <AccordionItem value="text" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Page text</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Bilingual label="Title" enKey="title" arKey="title_ar" />
            <Bilingual label="Subtitle" enKey="subtitle" arKey="subtitle_ar" multiline />
            <Bilingual label="Email field label" enKey="email_label" arKey="email_label_ar" />
            <Bilingual label="Email placeholder" enKey="email_placeholder" arKey="email_placeholder_ar" />
            <Bilingual label="Password field label" enKey="password_label" arKey="password_label_ar" />
            <Bilingual label="Password placeholder" enKey="password_placeholder" arKey="password_placeholder_ar" />
            {pageKey === "signup" && (
              <>
                <Bilingual label="Full name label" enKey="full_name_label" arKey="full_name_label_ar" />
                <Bilingual label="Full name placeholder" enKey="full_name_placeholder" arKey="full_name_placeholder_ar" />
                <Bilingual label="Terms text" enKey="terms_text" arKey="terms_text_ar" multiline />
              </>
            )}
            {pageKey === "signin" && (
              <Bilingual label='"Forgot password?" link' enKey="forgot_link_label" arKey="forgot_link_label_ar" />
            )}
            <Bilingual label='Divider text (e.g. "or")' enKey="divider_text" arKey="divider_text_ar" />
          </AccordionContent>
        </AccordionItem>

        {/* Submit button */}
        <AccordionItem value="submit" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Submit button</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Bilingual label="Button label" enKey="submit_label" arKey="submit_label_ar" />
            <Bilingual label="Loading label" enKey="submit_loading_label" arKey="submit_loading_label_ar" />
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Style variant">
                <Select value={draft.submit_variant} onValueChange={(v) => set("submit_variant", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Background color (hex)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={draft.submit_bg_color ?? "#000000"}
                    onChange={(e) => set("submit_bg_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={draft.submit_bg_color ?? ""}
                    onChange={(e) => set("submit_bg_color", e.target.value || null)}
                    placeholder="leave blank for theme"
                  />
                </div>
              </Field>
              <Field label="Text color (hex)">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={draft.submit_text_color ?? "#ffffff"}
                    onChange={(e) => set("submit_text_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={draft.submit_text_color ?? ""}
                    onChange={(e) => set("submit_text_color", e.target.value || null)}
                    placeholder="leave blank for theme"
                  />
                </div>
              </Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Size">
                <Select value={draft.submit_size} onValueChange={(v) => set("submit_size", v as Draft["submit_size"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Corner radius">
                <Select value={draft.submit_radius} onValueChange={(v) => set("submit_radius", v as Draft["submit_radius"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Square</SelectItem>
                    <SelectItem value="md">Rounded</SelectItem>
                    <SelectItem value="full">Pill</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Shadow">
                <Select value={draft.submit_shadow} onValueChange={(v) => set("submit_shadow", v as Draft["submit_shadow"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="glow">Glow (accent)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                <Label className="text-sm">Full width</Label>
                <Switch
                  checked={draft.submit_full_width}
                  onCheckedChange={(v) => set("submit_full_width", v)}
                />
              </div>
              <Field label="Hover background color">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={draft.submit_hover_bg_color ?? "#000000"}
                    onChange={(e) => set("submit_hover_bg_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={draft.submit_hover_bg_color ?? ""}
                    onChange={(e) => set("submit_hover_bg_color", e.target.value || null)}
                    placeholder="leave blank for theme"
                  />
                </div>
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Google + footer */}
        <AccordionItem value="google" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Google button & footer link</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <Label className="text-sm">Show Google sign-in button</Label>
              <Switch checked={draft.google_enabled} onCheckedChange={(v) => set("google_enabled", v)} />
            </div>
            <Bilingual label="Google button label" enKey="google_label" arKey="google_label_ar" />

            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <Label className="text-sm">Show footer link</Label>
              <Switch checked={draft.footer_link_enabled} onCheckedChange={(v) => set("footer_link_enabled", v)} />
            </div>
            <Bilingual label="Footer prefix text" enKey="footer_prefix" arKey="footer_prefix_ar" />
            <Bilingual label="Footer link label" enKey="footer_link_label" arKey="footer_link_label_ar" />
            <Field label="Footer link URL (e.g. /signup)">
              <Input
                value={draft.footer_link_url ?? ""}
                onChange={(e) => set("footer_link_url", e.target.value || null)}
                placeholder="/signup"
              />
            </Field>
          </AccordionContent>
        </AccordionItem>

        {/* Toggles */}
        <AccordionItem value="toggles" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Feature toggles</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            {pageKey === "signin" && (
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                <Label className="text-sm">Show "Forgot password?" link</Label>
                <Switch checked={draft.forgot_link_enabled} onCheckedChange={(v) => set("forgot_link_enabled", v)} />
              </div>
            )}
            {pageKey === "signup" && (
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                <Label className="text-sm">Show terms checkbox</Label>
                <Switch checked={draft.show_terms_checkbox} onCheckedChange={(v) => set("show_terms_checkbox", v)} />
              </div>
            )}
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <Label className="text-sm">Show left brand panel (desktop)</Label>
              <Switch checked={draft.show_brand_panel} onCheckedChange={(v) => set("show_brand_panel", v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand panel content */}
        <AccordionItem value="brand" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Brand panel content</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Bilingual label="Badge text" enKey="brand_badge" arKey="brand_badge_ar" />
            <Bilingual label="Headline" enKey="brand_headline" arKey="brand_headline_ar" multiline />
            <Bilingual label="Footer copyright" enKey="brand_footer_text" arKey="brand_footer_text_ar" />

            {(["en", "ar"] as const).map((lng) => {
              const list = (lng === "en" ? draft.brand_benefits : draft.brand_benefits_ar) as AuthBenefit[];
              return (
                <div key={lng} className="border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase">
                      Benefits ({lng.toUpperCase()})
                    </Label>
                    <Button type="button" size="sm" variant="outline" onClick={() => addBenefit(lng)}>
                      <Plus size={12} className="mr-1" /> Add
                    </Button>
                  </div>
                  {list.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No benefits yet.</p>
                  )}
                  {list.map((b, idx) => (
                    <div key={idx} className="grid sm:grid-cols-[120px_1fr_2fr_auto] gap-2 items-start">
                      <Select
                        value={b.icon ?? "Sparkles"}
                        onValueChange={(v) => setBenefit(lng, idx, { icon: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input
                        dir={lng === "ar" ? "rtl" : "ltr"}
                        placeholder="Title"
                        value={b.title ?? ""}
                        onChange={(e) => setBenefit(lng, idx, { title: e.target.value })}
                      />
                      <Input
                        dir={lng === "ar" ? "rtl" : "ltr"}
                        placeholder="Description"
                        value={b.desc ?? ""}
                        onChange={(e) => setBenefit(lng, idx, { desc: e.target.value })}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeBenefit(lng, idx)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* Background */}
        <AccordionItem value="bg" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Brand panel background</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Set a background image (wins if both set), or pick gradient colors. Use any CSS color (hex, hsl, or <code>hsl(var(--primary))</code>).
            </p>
            <Field label="Background image URL">
              <div className="flex gap-2">
                <Input
                  value={draft.background_image_url ?? ""}
                  onChange={(e) => set("background_image_url", e.target.value || null)}
                  placeholder="https://… or pick from library"
                />
                <Button type="button" variant="outline" onClick={() => setMediaPickerOpen(true)}>
                  <ImageIcon size={14} className="mr-1" /> Pick
                </Button>
                {draft.background_image_url && (
                  <Button type="button" variant="ghost" onClick={() => set("background_image_url", null)}>
                    Clear
                  </Button>
                )}
              </div>
              {draft.background_image_url && (
                <img
                  src={draft.background_image_url}
                  alt="Background preview"
                  className="mt-2 max-h-32 rounded border object-cover"
                />
              )}
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Gradient from">
                <Input
                  value={draft.background_gradient_from ?? ""}
                  onChange={(e) => set("background_gradient_from", e.target.value || null)}
                  placeholder="hsl(var(--primary))"
                />
              </Field>
              <Field label="Gradient to">
                <Input
                  value={draft.background_gradient_to ?? ""}
                  onChange={(e) => set("background_gradient_to", e.target.value || null)}
                  placeholder="hsl(var(--accent))"
                />
              </Field>
            </div>
            <Field label={`Dark overlay opacity (${draft.background_overlay_opacity})`}>
              <Input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={draft.background_overlay_opacity}
                onChange={(e) => set("background_overlay_opacity", Number(e.target.value))}
              />
            </Field>
          </AccordionContent>
        </AccordionItem>

        {/* Hero illustration & decorative pattern */}
        <AccordionItem value="illustration" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Hero illustration & pattern</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Add a foreground illustration on top of the background, and pick an optional decorative pattern overlay.
            </p>

            <Field label="Illustration image URL">
              <div className="flex gap-2">
                <Input
                  value={draft.illustration_url ?? ""}
                  onChange={(e) => set("illustration_url", e.target.value || null)}
                  placeholder="https://… or pick from library"
                />
                <Button type="button" variant="outline" onClick={() => setIllustrationPickerOpen(true)}>
                  <ImageIcon size={14} className="mr-1" /> Pick
                </Button>
                {draft.illustration_url && (
                  <Button type="button" variant="ghost" onClick={() => set("illustration_url", null)}>
                    Clear
                  </Button>
                )}
              </div>
              {draft.illustration_url && (
                <img
                  src={draft.illustration_url}
                  alt="Illustration preview"
                  className="mt-2 max-h-32 rounded border object-contain bg-muted/30"
                />
              )}
            </Field>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Illustration position">
                <Select
                  value={draft.illustration_alignment}
                  onValueChange={(v) => set("illustration_alignment", v as Draft["illustration_alignment"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Above headline</SelectItem>
                    <SelectItem value="center">Between headline & benefits</SelectItem>
                    <SelectItem value="bottom">Below benefits</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`Max width: ${draft.illustration_max_width}px`}>
                <Input
                  type="range"
                  min={160}
                  max={640}
                  step={20}
                  value={draft.illustration_max_width}
                  onChange={(e) => set("illustration_max_width", Number(e.target.value))}
                />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Decorative pattern overlay">
                <Select
                  value={draft.pattern_overlay}
                  onValueChange={(v) => set("pattern_overlay", v as Draft["pattern_overlay"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="grid">Grid lines</SelectItem>
                    <SelectItem value="waves">Diagonal waves</SelectItem>
                    <SelectItem value="noise">Subtle noise</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`Pattern opacity (${draft.pattern_overlay_opacity.toFixed(2)})`}>
                <Input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={draft.pattern_overlay_opacity}
                  onChange={(e) => set("pattern_overlay_opacity", Number(e.target.value))}
                />
              </Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand-panel logo */}
        <AccordionItem value="logo" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold">Brand panel logo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <Label className="text-sm">Show logo in brand panel</Label>
              <Switch
                checked={draft.logo_visible}
                onCheckedChange={(v) => set("logo_visible", v)}
              />
            </div>

            <Field label="Custom logo URL (leave blank to use site logo)">
              <div className="flex gap-2">
                <Input
                  value={draft.logo_url ?? ""}
                  onChange={(e) => set("logo_url", e.target.value || null)}
                  placeholder="https://… or pick from library"
                />
                <Button type="button" variant="outline" onClick={() => setLogoPickerOpen(true)}>
                  <ImageIcon size={14} className="mr-1" /> Pick
                </Button>
                {draft.logo_url && (
                  <Button type="button" variant="ghost" onClick={() => set("logo_url", null)}>
                    Clear
                  </Button>
                )}
              </div>
              {draft.logo_url && (
                <img
                  src={draft.logo_url}
                  alt="Logo preview"
                  className="mt-2 max-h-16 rounded border object-contain bg-muted/30 p-2"
                />
              )}
            </Field>

            <Field label="Position">
              <Select
                value={draft.logo_position}
                onValueChange={(v) => set("logo_position", v as Draft["logo_position"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top-left (default)</SelectItem>
                  <SelectItem value="top-center">Top-center</SelectItem>
                  <SelectItem value="above-headline">Above headline</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
          Save changes
        </Button>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => {
          set("background_image_url", url);
          setMediaPickerOpen(false);
        }}
        uploadFolder="auth-pages"
        title="Pick background image"
      />
      <MediaPicker
        open={illustrationPickerOpen}
        onOpenChange={setIllustrationPickerOpen}
        onSelect={(url) => {
          set("illustration_url", url);
          setIllustrationPickerOpen(false);
        }}
        uploadFolder="auth-pages"
        title="Pick illustration"
      />
      <MediaPicker
        open={logoPickerOpen}
        onOpenChange={setLogoPickerOpen}
        onSelect={(url) => {
          set("logo_url", url);
          setLogoPickerOpen(false);
        }}
        uploadFolder="auth-pages"
        title="Pick logo image"
      />
    </div>
  );
};

const AuthPagesManager = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Sign in / Sign up pages</h3>
        <p className="text-sm text-muted-foreground">
          Edit all text, visuals, buttons, and toggles for the public auth pages.
        </p>
      </div>
      <Tabs defaultValue="signin">
        <TabsList>
          <TabsTrigger value="signin">Sign in page</TabsTrigger>
          <TabsTrigger value="signup">Sign up page</TabsTrigger>
        </TabsList>
        <TabsContent value="signin" className="mt-4">
          <PageEditor pageKey="signin" />
        </TabsContent>
        <TabsContent value="signup" className="mt-4">
          <PageEditor pageKey="signup" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPagesManager;
