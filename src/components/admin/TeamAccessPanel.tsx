import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, Loader2, Shield, UserPlus, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TEAM_ROLES, TeamRole } from "@/hooks/useTeamAccess";

interface InvitedRow {
  id: string;
  email: string;
  role: TeamRole;
  invited_at: string;
  accepted_at: string | null;
}

/**
 * Team access control center. Visible only to the super-admin
 * (marketing@infasme.com). Shows current invites + their status, and a form
 * to invite new team members with a predefined role.
 *
 * Flow:
 *   1. Super-admin enters email + picks role
 *   2. Edge function `invite-team-member` (a) records the invite, (b) either
 *      assigns the role directly if the user already exists OR sends a
 *      Supabase Auth invite email so they create an account
 *   3. When the invitee signs up, a DB trigger applies the assigned role
 */
const TeamAccessPanel = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("editor");
  const [submitting, setSubmitting] = useState(false);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["team-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invited_team_members")
        .select("id, email, role, invited_at, accepted_at")
        .order("invited_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvitedRow[];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "invite-team-member",
        { body: { email: email.trim().toLowerCase(), role } },
      );
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }
      const mode = (data as { mode?: string })?.mode;
      toast({
        title:
          mode === "existing_user"
            ? "Role assigned"
            : "Invitation sent",
        description:
          mode === "existing_user"
            ? `${email} already has an account — role applied immediately.`
            : `An invite email was sent to ${email}.`,
      });
      setEmail("");
      qc.invalidateQueries({ queryKey: ["team-invites"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send invite";
      toast({ title: "Invite failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (row: InvitedRow) => {
    if (
      !confirm(
        `Revoke ${row.email}? This removes them from the invite list. If they already created an account, you'll also need to remove their role from the Users tab.`,
      )
    )
      return;
    const { error } = await supabase
      .from("invited_team_members")
      .delete()
      .eq("id", row.id);
    if (error) {
      toast({ title: "Could not revoke", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invite revoked" });
    qc.invalidateQueries({ queryKey: ["team-invites"] });
  };

  const roleMeta = (r: TeamRole) =>
    TEAM_ROLES.find((x) => x.value === r) ?? TEAM_ROLES[0];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Team access</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Invite teammates by email and assign a role. They'll receive an
            invite email to create an account, then automatically get the
            permissions you choose. Only you (
            <span className="font-mono text-xs">marketing@infasme.com</span>)
            can manage this list.
          </p>
        </div>
      </div>

      {/* Invite form */}
      <form
        onSubmit={submit}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserPlus size={16} className="text-accent" />
          Invite a team member
        </div>

        <div className="grid sm:grid-cols-[1fr_220px_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as TeamRole)}
              disabled={submitting}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{roleMeta(role).label}:</span>{" "}
          {roleMeta(role).description}
        </p>
      </form>

      {/* Existing invites */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Invited team members
            <span className="text-muted-foreground font-normal ml-2">
              ({invites.length})
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : invites.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No invites yet. Send your first one above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {roleMeta(row.role).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.accepted_at ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                        <CheckCircle2 size={12} /> Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.invited_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => revoke(row)}
                      title="Revoke invite"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Role reference */}
      <div className="bg-muted/30 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          What each role can do
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {TEAM_ROLES.map((r) => (
            <div
              key={r.value}
              className="bg-card border border-border rounded-lg p-3"
            >
              <div className="text-sm font-semibold text-foreground">
                {r.label}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamAccessPanel;
