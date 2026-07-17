type LinkEntry = {
  href: string;
};

export function filterAdminLinks<T extends LinkEntry>(items: T[], hasAdminAccess: boolean): T[] {
  if (hasAdminAccess) {
    return items;
  }

  return items.filter((item) => item.href !== "/admin");
}
