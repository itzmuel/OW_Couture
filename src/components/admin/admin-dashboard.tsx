import Link from "next/link";

const summaryCards = [
  { label: "Today's Revenue", value: "$8,450" },
  { label: "Orders Awaiting Review", value: "12" },
  { label: "Consultations Today", value: "4" },
  { label: "Orders In Production", value: "38" },
  { label: "Ready for Pickup", value: "6" },
  { label: "Pending Payments", value: "3" },
  { label: "Recent Messages", value: "8" },
];

const chartTiles = [
  { title: "Revenue", values: [20, 30, 25, 45, 50, 62, 56, 70] },
  { title: "Monthly Orders", values: [8, 10, 7, 14, 16, 13, 18, 19] },
  { title: "Top Selling Dresses", values: [12, 22, 18, 27, 30, 26, 34, 36] },
  { title: "Consultations", values: [6, 8, 7, 10, 9, 12, 11, 14] },
  { title: "Returning Customers", values: [4, 5, 6, 5, 8, 7, 9, 10] },
];

const quickActions = [
  { label: "Review Orders", href: "/admin/orders" },
  { label: "Open Production Tracker", href: "/admin/production" },
  { label: "Manage Consultations", href: "/admin/consultations" },
  { label: "Edit Website Content", href: "/admin/website" },
];

export function AdminDashboard() {
  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Dashboard</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,52px)] leading-[1] tracking-[-0.05em] text-neutral-950">Good morning, Olivia</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          This command center tracks revenue, orders, production flow, consultations, and customer engagement in one place.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {chartTiles.map((tile) => (
          <article key={tile.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg tracking-[-0.03em] text-neutral-950">{tile.title}</h3>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Last 8 weeks</p>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2">
              {tile.values.map((value, index) => (
                <div
                  key={`${tile.title}-${index}`}
                  className="min-w-0 flex-1 rounded-t-lg bg-black/85"
                  style={{ height: `${Math.max(value, 8)}%` }}
                  title={`${tile.title}: ${value}`}
                />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl tracking-[-0.04em] text-neutral-950">Quick actions</h3>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Operations</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-800 transition hover:border-black hover:bg-[var(--soft)]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
