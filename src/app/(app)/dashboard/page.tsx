import Link from "next/link";
import { Role } from "@prisma/client";
import { ConnectButton } from "@/components/connect-button";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/authorization";
import { getDashboardData } from "@/lib/cloud-pcs";
import { formatDateTime, formatDuration } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardData(user);

  const cards = [
    { label: "Total cloud PCs", value: dashboard.totals.total, tone: "bg-slate-50 text-slate-900" },
    { label: "Available", value: dashboard.totals.AVAILABLE, tone: "bg-emerald-50 text-emerald-900" },
    { label: "Occupied", value: dashboard.totals.OCCUPIED, tone: "bg-amber-50 text-amber-900" },
    { label: "Offline", value: dashboard.totals.OFFLINE, tone: "bg-slate-100 text-slate-800" },
    {
      label: "Maintenance / Repair",
      value: dashboard.totals.MAINTENANCE + dashboard.totals.REPAIR,
      tone: "bg-rose-50 text-rose-900",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Live cloud PC availability</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            See the most important information first, connect to an available cloud PC quickly, and keep an eye on recent activity.
          </p>
        </div>
        <Link href="/cloud-pcs" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Browse all cloud PCs →
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl border border-slate-200 p-5 ${card.tone}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick connect</h2>
              <p className="mt-1 text-sm text-slate-500">Choose an available cloud PC and connect without any booking step.</p>
            </div>
          </div>

          {dashboard.availableNow.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
              No cloud PCs are available right now. Please check again shortly or contact an admin if you need help.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {dashboard.availableNow.slice(0, 4).map((cloudPc) => (
                <div key={cloudPc.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{cloudPc.name}</h3>
                      <StatusBadge status={cloudPc.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{cloudPc.description ?? "No description provided yet."}</p>
                    <p className="mt-2 text-sm text-slate-500">Last seen online {formatDateTime(cloudPc.lastSeenAt)}</p>
                  </div>
                  <ConnectButton cloudPcId={cloudPc.id} disabled={!cloudPc.connectability.allowed} disabledReason={cloudPc.connectability.reason} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {user.role === Role.ADMIN ? "Recent occupancy activity" : "Your recent cloud PC activity"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === Role.ADMIN
              ? "Review recent sessions, current usage, and force-ended sessions across the portal."
              : "Review your most recent sessions and how long you spent in each cloud desktop."}
          </p>
          <div className="mt-5 space-y-4">
            {dashboard.recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No activity has been recorded yet.
              </div>
            ) : (
              dashboard.recentActivity.map((session) => (
                <div key={session.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{session.cloudPc.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {user.role === Role.ADMIN ? `${session.user.name ?? session.user.email} • ` : ""}
                        Started {formatDateTime(session.startedAt)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{session.status}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {session.endedAt ? `Duration ${formatDuration(session.durationSeconds)}` : "Session currently active"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
