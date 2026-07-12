import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw } from "lucide-react";

type Row = {
  id: string;
  button_key: string;
  label: string;
  label_ar: string | null;
  link: string;
  variant: string;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  visible: boolean;
  sort_order: number;
  helper_caption: string | null;
  helper_caption_ar: string | null;
};

const variants = [
  { value: "default", label: "Primary (filled)" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost (text only)" },
  { value: "secondary", label: "Secondary" },
  { value: "accent", label: "Accent" },
];

const friendlyLabel = (key: string) =>
  key === "signin" ? "Log in button" : key === "signup" ? "Sign up button" : key;

const AuthButtonsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, Row>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-nav-auth-buttons"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("nav_auth_buttons")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    if (!data) return;
    const map: Record<string, Row> = {};
    data.forEach((r) => (map[r.id] = r));
    setDrafts(map);
  }, [data]);

  const update = (id: string, patch: Partial<Row>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const reset = (id: string) => {
    const original = data?.find((r) => r.id === id);
    if (original) update(id, original);
  };

  const save = async (id: string) => {
    const row = drafts[id];
    if (!row) return;
    setSavingId(id);
    const { error } = await supabase
      .from("nav_auth_buttons")
      .update({
        label: row.label,
        label_ar: row.label_ar,
        link: row.link,
        variant: row.variant,
        custom_bg_color: row.custom_bg_color,
        custom_text_color: row.custom_text_color,
        helper_caption: row.helper_caption,
        helper_caption_ar: row.helper_caption_ar,
        visible: row.visible,
      })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: `${friendlyLabel(row.button_key)} updated.` });
    queryClient.invalidateQueries({ queryKey: ["admin-nav-auth-buttons"] });
    queryClient.invalidateQueries({ queryKey: ["nav-auth-buttons"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading…
      </div>
    );
  }

  const rows = Object.values(drafts).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Navbar Auth Buttons</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Edit the labels, links, style and visibility of the public Sign up and Log in
          buttons. Admin login is unaffected.
        </p>
      </div>

      <div className="space-y-5">
        {rows.map((row) => {
          const original = data?.find((r) => r.id === row.id);
          const dirty =
            !!original &&
            JSON.stringify({ ...original }) !== JSON.stringify({ ...row });

          return (
            <div
              key={row.id}
              className="rounded-2xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-lg">{friendlyLabel(row.button_key)}</h3>
                  <p className="text-xs text-muted-foreground">
                    Key: <code>{row.button_key}</code>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.visible}
                      onCheckedChange={(v) => update(row.id, { visible: v })}
                    />
                    <span className="text-sm">{row.visible ? "Visible" : "Hidden"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Label (English)</Label>
                  <Input
                    value={row.label}
                    onChange={(e) => update(row.id, { label: e.target.value })}
                    placeholder="Log in"
                  />
                </div>
                <div>
                  <Label>Label (Arabic)</Label>
                  <Input
                    dir="rtl"
                    value={row.label_ar ?? ""}
                    onChange={(e) => update(row.id, { label_ar: e.target.value })}
                    placeholder="تسجيل الدخول"
                  />
                </div>

                <div>
                  <Label>Helper caption (English)</Label>
                  <Input
                    value={row.helper_caption ?? ""}
                    onChange={(e) =>
                      update(row.id, { helper_caption: e.target.value || null })
                    }
                    placeholder={
                      row.button_key === "signup"
                        ? "New here? Create an account"
                        : "Already a member? Welcome back"
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Short hint shown under the button. Leave empty to hide.
                  </p>
                </div>
                <div>
                  <Label>Helper caption (Arabic)</Label>
                  <Input
                    dir="rtl"
                    value={row.helper_caption_ar ?? ""}
                    onChange={(e) =>
                      update(row.id, { helper_caption_ar: e.target.value || null })
                    }
                    placeholder={
                      row.button_key === "signup"
                        ? "جديد هنا؟ أنشئ حسابًا"
                        : "هل أنت عضو بالفعل؟ مرحبًا بعودتك"
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Destination link</Label>
                  <Input
                    value={row.link}
                    onChange={(e) => update(row.id, { link: e.target.value })}
                    placeholder="/signin or https://example.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an internal path like <code>/signin</code> or a full URL starting
                    with <code>https://</code>.
                  </p>
                </div>

                <div>
                  <Label>Style</Label>
                  <Select
                    value={row.variant}
                    onValueChange={(v) => update(row.id, { variant: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Background color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-14 p-1 h-10"
                        value={row.custom_bg_color ?? "#000000"}
                        onChange={(e) =>
                          update(row.id, { custom_bg_color: e.target.value })
                        }
                      />
                      <Input
                        placeholder="#3B82F6 or empty"
                        value={row.custom_bg_color ?? ""}
                        onChange={(e) =>
                          update(row.id, {
                            custom_bg_color: e.target.value || null,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Text color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-14 p-1 h-10"
                        value={row.custom_text_color ?? "#ffffff"}
                        onChange={(e) =>
                          update(row.id, { custom_text_color: e.target.value })
                        }
                      />
                      <Input
                        placeholder="#FFFFFF or empty"
                        value={row.custom_text_color ?? ""}
                        onChange={(e) =>
                          update(row.id, {
                            custom_text_color: e.target.value || null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Leave colors empty to use the chosen style's defaults.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reset(row.id)}
                    disabled={!dirty || savingId === row.id}
                  >
                    <RotateCcw size={14} className="mr-1.5" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => save(row.id)}
                    disabled={!dirty || savingId === row.id}
                  >
                    {savingId === row.id ? (
                      <Loader2 className="animate-spin mr-1.5" size={14} />
                    ) : (
                      <Save size={14} className="mr-1.5" />
                    )}
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuthButtonsManager;
