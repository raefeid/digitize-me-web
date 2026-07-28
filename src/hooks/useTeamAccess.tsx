import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Predefined role catalog. Keep in sync with the `app_role` enum in the
 * database. The order here drives display order in the UI.
 */
export const TEAM_ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to everything, including team management.",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Can edit website content (text & images) on every page.",
  },
  {
    value: "seo_manager",
    label: "SEO Manager",
    description: "Can edit SEO meta tags, sitemap, robots and tracking scripts.",
  },
  {
    value: "blog_author",
    label: "Blog Author",
    description: "Can write, edit and publish blog posts and categories.",
  },
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number]["value"];

/**
 * Per-feature capability matrix. Drives both UI gating (hide cards/tabs the
 * user cannot use) and is mirrored in DB RLS policies so users cannot bypass
 * via direct API calls.
 */
export const ROLE_CAPABILITIES: Record<
  TeamRole,
  {
    visualEditor: boolean;
    blog: boolean;
    siteContent: boolean;
    pricing: boolean;
    media: boolean;
    seo: boolean;
    sitemap: boolean;
    integrations: boolean;
    ctas: boolean;
    reveals: boolean;
    homePage: boolean;
    promotions: boolean;
    teamAccess: boolean; // managed separately by super-admin only
  }
> = {
  admin: {
    visualEditor: true, blog: true, siteContent: true, pricing: true, media: true,
    seo: true, sitemap: true, integrations: true, ctas: true, reveals: true,
    homePage: true, promotions: true, teamAccess: false,
  },
  editor: {
    visualEditor: true, blog: false, siteContent: true, pricing: true, media: true,
    seo: false, sitemap: false, integrations: false, ctas: true, reveals: true,
    homePage: true, promotions: true, teamAccess: false,
  },
  seo_manager: {
    visualEditor: false, blog: false, siteContent: false, pricing: false, media: true,
    seo: true, sitemap: true, integrations: true, ctas: false, reveals: false,
    homePage: false, promotions: false, teamAccess: false,
  },
  blog_author: {
    visualEditor: false, blog: true, siteContent: false, pricing: false, media: true,
    seo: false, sitemap: false, integrations: false, ctas: false, reveals: false,
    homePage: false, promotions: false, teamAccess: false,
  },
};

const SUPER_ADMIN_EMAIL = "marketing@infasme.com";

/**
 * Resolves the current user's roles, the strongest "predominant" role, and
 * exposes a `can(feature)` helper for UI gating. Super-admin
 * (marketing@infasme.com) is treated as full admin AND is the only one who
 * sees the Users / team-access tab.
 */
export const useTeamAccess = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as TeamRole);
    },
  });

  const isSuperAdmin =
    !!user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL;

  const myRoles: TeamRole[] = roles.length
    ? roles
    : isAdmin
      ? ["admin"]
      : [];

  const can = (feature: keyof (typeof ROLE_CAPABILITIES)["admin"]): boolean => {
    if (isSuperAdmin) return true;
    return myRoles.some((r) => ROLE_CAPABILITIES[r]?.[feature]);
  };

  return {
    loading: authLoading || rolesLoading,
    isSuperAdmin,
    isAdmin,
    roles: myRoles,
    can,
  };
};
