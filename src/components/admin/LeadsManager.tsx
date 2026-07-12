import { useState } from "react";
import { Mail, Phone, Building2, Globe, Trash2, ChevronDown, ChevronRight, Download } from "lucide-react";
import { useAdminLeads, useUpdateLeadStatus, useDeleteLead, Lead } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  qualified: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  won: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  lost: "bg-muted text-muted-foreground border-border",
};

const LeadsManager = () => {
  const { data: leads = [], isLoading } = useAdminLeads();
  const updateStatus = useUpdateLeadStatus();
  const del = useDeleteLead();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  const selectedVisibleIds = visible.filter((lead) => selectedIds.includes(lead.id)).map((lead) => lead.id);
  const allVisibleSelected = visible.length > 0 && selectedVisibleIds.length === visible.length;

  const exportCsv = (rows: Lead[], suffix: string) => {
    const headers = [
      "created_at", "full_name", "work_email", "phone", "company", "company_size",
      "industry", "use_case", "message", "cta_source", "page_path",
      "utm_source", "utm_medium", "utm_campaign", "status",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [
      headers.join(","),
      ...rows.map((l) => headers.map((h) => escape((l as unknown as Record<string, unknown>)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return [...new Set([...prev, ...visible.map((lead) => lead.id)])];
      return prev.filter((id) => !visible.some((lead) => lead.id === id));
    });
  };

  const remove = (l: Lead) => {
    if (!confirm(`Delete lead from ${l.full_name}?`)) return;
    del.mutate(l.id, {
      onSuccess: () => toast({ title: "Lead deleted" }),
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submissions from the lead capture modal — most recent first.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportCsv(visible, filter === "all" ? "filtered-all" : filter)} className="gap-1.5" disabled={visible.length === 0}>
            <Download size={14} /> Export filtered
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCsv(leads.filter((lead) => selectedIds.includes(lead.id)), "selected")} className="gap-1.5" disabled={selectedIds.length === 0}>
            <Download size={14} /> Export selected
          </Button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All (${leads.length})`}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={`${s} (${counts[s] ?? 0})`}
          />
        ))}
      </div>

      {visible.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => toggleAllVisible(checked === true)} />
            <span>Select all visible</span>
          </label>
          <span>{selectedIds.length} selected</span>
          <button onClick={() => setSelectedIds([])} className="text-accent hover:underline" disabled={selectedIds.length === 0}>
            Clear selection
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/40 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
          No leads {filter !== "all" ? `with status "${filter}"` : "yet"}.
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((lead) => {
            const isOpen = expanded === lead.id;
            return (
              <div key={lead.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 flex items-center gap-3">
                  <Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={(checked) => toggleSelected(lead.id, checked === true)} aria-label={`Select ${lead.full_name}`} />
                  <button
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{lead.full_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_BADGE[lead.status]}`}>
                        {lead.status}
                      </span>
                      {lead.company && (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Building2 size={10} /> {lead.company}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      <a href={`mailto:${lead.work_email}`} className="hover:text-accent">
                        {lead.work_email}
                      </a>
                      {" · "}
                      {new Date(lead.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Select
                    value={lead.status}
                    onValueChange={(v) =>
                      updateStatus.mutate(
                        { id: lead.id, status: v },
                        { onSuccess: () => toast({ title: "Status updated" }) },
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(lead)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                {isOpen && (
                  <div className="border-t border-border bg-muted/20 p-4 grid sm:grid-cols-2 gap-3 text-xs">
                    <Field icon={Mail} label="Email" value={lead.work_email} />
                    <Field icon={Phone} label="Phone" value={lead.phone} />
                    <Field icon={Building2} label="Company size" value={lead.company_size} />
                    <Field label="Use case" value={lead.use_case} />
                    <Field label="Industry" value={lead.industry} />
                    <Field icon={Globe} label="Page" value={lead.page_path} />
                    <Field label="CTA source" value={lead.cta_source} />
                    <Field
                      label="UTM"
                      value={[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || null}
                    />
                    {lead.message && (
                      <div className="sm:col-span-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Message</div>
                        <p className="text-foreground/80 whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs border capitalize ${
      active
        ? "bg-accent text-accent-foreground border-accent"
        : "bg-card text-foreground/70 border-border hover:border-accent/40"
    }`}
  >
    {label}
  </button>
);

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string | null | undefined;
}) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5 flex items-center gap-1">
      {Icon && <Icon size={10} />} {label}
    </div>
    <div className="text-foreground/80 truncate">{value || <span className="text-muted-foreground/50">—</span>}</div>
  </div>
);

export default LeadsManager;
