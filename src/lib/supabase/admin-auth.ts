import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminAuthFailure = {
  ok: false;
  status: 401 | 403 | 500;
  message: string;
};

type AdminAuthSuccess = {
  ok: true;
  email: string;
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

export async function ensureAdminUser(): Promise<AdminAuthFailure | AdminAuthSuccess> {
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

  return {
    ok: true,
    email: user.email,
  };
}
