import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultRolePermissions, hasAdminPermission, type AdminPermission, type AdminTeamMember } from "@/lib/admin/team";

type AdminAuthFailure = {
  ok: false;
  status: 401 | 403 | 500;
  message: string;
};

type AdminAuthSuccess = {
  ok: true;
  email: string;
  role: AdminTeamMember["role"];
  permissions: string[];
};

type TeamRow = {
  email: string;
  full_name: string;
  role: AdminTeamMember["role"];
  permissions: string[];
  active: boolean;
};

export function getAllowedAdminEmails() {
  const rawValue = process.env.ADMIN_EMAILS ?? "";

  return rawValue
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAllowedAdminEmails().includes(email.toLowerCase());
}

export function isAdminListConfigured() {
  return getAllowedAdminEmails().length > 0;
}

export async function ensureAdminUser(requiredPermission?: AdminPermission): Promise<AdminAuthFailure | AdminAuthSuccess> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      ok: false,
      status: 401,
      message: "Authentication required.",
    };
  }

  const allowedEmails = getAllowedAdminEmails();
  if (allowedEmails.length === 0) {
    return {
      ok: false,
      status: 500,
      message: "ADMIN_EMAILS is not configured.",
    };
  }

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    return {
      ok: false,
      status: 403,
      message: "You are not allowed to access admin data.",
    };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: teamMemberData, error: teamMemberError } = await adminClient
    .from("admin_team_members")
    .select("email,full_name,role,permissions,active")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (teamMemberError) {
    return {
      ok: false,
      status: 500,
      message: teamMemberError.message,
    };
  }

  const teamMember = teamMemberData as TeamRow | null;
  const role = teamMember?.role ?? "Admin";
  const permissions = teamMember?.permissions?.length ? teamMember.permissions : defaultRolePermissions[role];

  if (teamMember && !teamMember.active) {
    return {
      ok: false,
      status: 403,
      message: "Your admin access is inactive.",
    };
  }

  if (!hasAdminPermission(permissions, requiredPermission)) {
    return {
      ok: false,
      status: 403,
      message: "You do not have permission to access this admin section.",
    };
  }

  return {
    ok: true,
    email: user.email,
    role,
    permissions,
  };
}
