import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Search, Download, ShieldCheck, ShieldAlert, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomerAccount {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const CustomerAccountsManager = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["customer-accounts"],
    queryFn: async (): Promise<CustomerAccount[]> => {
      const { data, error } = await supabase.functions.invoke<{
        accounts: CustomerAccount[];
      }>("list-customer-accounts", { body: {} });
      if (error) throw error;
      return data?.accounts ?? [];
    },
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) =>
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.full_name ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const exportCsv = () => {
    const headers = ["created_at", "full_name", "email", "email_confirmed_at", "last_sign_in_at", "id"];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((a) =>
      headers.map((h) => escape((a as unknown as Record<string, unknown>)[h])).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalConfirmed = (data ?? []).filter((a) => !!a.email_confirmed_at).length;
  const totalUnconfirmed = (data ?? []).length - totalConfirmed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Customer accounts</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          People who registered through the public <strong>Sign up</strong> form on the website. These accounts are
          completely separate from the admin team — they exist so customers can buy bundles and access features.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total accounts</div>
          <div className="text-2xl font-bold text-foreground mt-1">{data?.length ?? 0}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Email verified
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalConfirmed}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert size={12} className="text-amber-500" /> Pending verification
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalUnconfirmed}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1">
          <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length} className="gap-1">
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={16} /> Loading customers…
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">
            Failed to load customer accounts: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            <Mail className="mx-auto mb-2 opacity-50" size={28} />
            {data?.length
              ? "No accounts match your search."
              : "No customer accounts yet. They'll appear here as people sign up."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold">Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground font-medium">
                      {a.full_name || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {a.email_confirmed_at ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <ShieldAlert size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.last_sign_in_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAccountsManager;
