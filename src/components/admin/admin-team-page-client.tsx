"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import {
  allAdminPermissions,
  defaultRolePermissions,
  permissionLabels,
  type AdminPermission,
  type AdminTeamMember,
} from "@/lib/admin/team";

const emptyMember: AdminTeamMember = {
  email: "",
  fullName: "",
  role: "Manager",
  permissions: defaultRolePermissions.Manager,
  active: true,
};

export function AdminTeamPageClient() {
  const { hasPermission } = useAdminAccess();
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [draft, setDraft] = useState<AdminTeamMember>(emptyMember);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const groupedPermissions = useMemo(() => {
    return [
      {
        title: "Operations",
        permissions: [
          "dashboard:view",
          "orders:view",
          "orders:manage",
          "production:view",
          "production:manage",
          "consultations:view",
          "consultations:manage",
          "payments:view",
          "payments:manage",
        ] satisfies AdminPermission[],
      },
      {
        title: "Catalog And Site",
        permissions: [
          "products:view",
          "products:manage",
          "products:archive",
          "collections:view",
          "collections:manage",
          "collections:archive",
          "website:view",
          "website:manage",
          "analytics:view",
        ] satisfies AdminPermission[],
      },
      {
        title: "CRM And Access",
        permissions: [
          "customers:view",
          "measurements:view",
          "team:view",
          "team:manage",
          "settings:view",
        ] satisfies AdminPermission[],
      },
    ];
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/team", { method: "GET", cache: "no-store" });
    const payload = (await response.json()) as { message?: string; members?: AdminTeamMember[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load team members.");
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setMembers(payload.members ?? []);
    setErrorMessage("");
    setIsLoading(false);
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const saveMember = async () => {
    if (!hasPermission("team:manage")) {
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save team member.");
      setIsSaving(false);
      return;
    }

    setDraft(emptyMember);
    setErrorMessage("");
    setIsSaving(false);
    await loadMembers();
  };

  const applyRolePreset = (role: AdminTeamMember["role"]) => {
    setDraft((current) => ({
      ...current,
      role,
      permissions: [...defaultRolePermissions[role]],
    }));
  };

  const togglePermission = (permission: AdminPermission) => {
    setDraft((current) => {
      const nextPermissions = current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission];

      const normalizedPermissions = nextPermissions.includes("admin:*")
        ? ["admin:*"]
        : nextPermissions.filter((item) => item !== "admin:*");

      return {
        ...current,
        permissions: normalizedPermissions,
      };
    });
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Team</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Roles and permissions</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Manage admins, managers, tailors, and customer service roles with stored permission bundles.
        </p>
      </header>

      {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Member</th>
                  <th className="px-2 py-3">Role</th>
                  <th className="px-2 py-3">Permissions</th>
                  <th className="px-2 py-3">State</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-2 py-6 text-sm text-[var(--muted)]">Loading team...</td></tr>
                ) : members.map((member) => (
                  <tr key={member.email} className="border-b border-[var(--line)]">
                    <td className="px-2 py-3">
                      <p className="font-medium text-neutral-900">{member.fullName}</p>
                      <p className="text-xs text-neutral-600">{member.email}</p>
                    </td>
                    <td className="px-2 py-3 text-neutral-700">{member.role}</td>
                    <td className="px-2 py-3 text-neutral-700">{member.permissions.map((permission) => permissionLabels[permission as AdminPermission] ?? permission).join(", ")}</td>
                    <td className="px-2 py-3 text-neutral-700">{member.active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="grid gap-3">
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Full Name<input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Email<input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Role<select value={draft.role} onChange={(event) => applyRolePreset(event.target.value as AdminTeamMember["role"])} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900"><option>Admin</option><option>Manager</option><option>Tailor</option><option>Customer Service</option></select></label>
            <div className="grid gap-3 rounded-2xl border border-[var(--line)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Permission Toggles</p>
                <button type="button" onClick={() => applyRolePreset(draft.role)} className="rounded-full border border-black px-3 py-1 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white">
                  Reset To {draft.role} Preset
                </button>
              </div>
              {groupedPermissions.map((group) => (
                <div key={group.title} className="grid gap-2">
                  <p className="text-sm font-medium text-neutral-900">{group.title}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.permissions.map((permission) => {
                      const checked = draft.permissions.includes(permission) || draft.permissions.includes("admin:*");
                      const disabled = draft.permissions.includes("admin:*");

                      return (
                        <label key={permission} className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-800">
                          <input type="checkbox" checked={checked} disabled={disabled} onChange={() => togglePermission(permission)} />
                          {permissionLabels[permission]}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!draft.permissions.includes("admin:*") ? (
                <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-800">
                  <input type="checkbox" checked={draft.permissions.includes("admin:*")} onChange={() => togglePermission("admin:*")} />
                  {permissionLabels["admin:*"]}
                </label>
              ) : (
                <label className="flex items-center gap-2 rounded-xl border border-black bg-black px-3 py-2 text-sm text-white">
                  <input type="checkbox" checked onChange={() => togglePermission("admin:*")} />
                  {permissionLabels["admin:*"]}
                </label>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-800"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /> Active</label>
            <button type="button" onClick={() => { void saveMember(); }} disabled={isSaving || !hasPermission("team:manage")} className="w-fit rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300">{isSaving ? "Saving..." : hasPermission("team:manage") ? "Save Team Member" : "View only"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}
