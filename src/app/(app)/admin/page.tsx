import { AdminConsole } from "@/components/admin-console";
import { requireAdmin } from "@/lib/authorization";
import { getAdminPageData } from "@/lib/cloud-pcs";

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminPageData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Manage cloud PCs and sessions</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Update status, change remote access URLs, add or remove cloud PCs, and review the audit log.
        </p>
      </div>
      <AdminConsole
        cloudPcs={data.cloudPcs.map((cloudPc) => ({
          ...cloudPc,
          lastSeenAt: cloudPc.lastSeenAt?.toISOString() ?? null,
          sessions: cloudPc.sessions.map((session) => ({
            id: session.id,
            startedAt: session.startedAt.toISOString(),
            status: session.status,
            user: {
              name: session.user.name,
              email: session.user.email,
            },
          })),
        }))}
        activeSessions={data.activeSessions.map((session) => ({
          id: session.id,
          startedAt: session.startedAt.toISOString(),
          cloudPc: {
            id: session.cloudPc.id,
            name: session.cloudPc.name,
          },
          user: {
            name: session.user.name,
            email: session.user.email,
          },
        }))}
        auditLogs={data.auditLogs.map((entry) => ({
          id: entry.id,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          createdAt: entry.createdAt.toISOString(),
          actorUser: entry.actorUser
            ? {
                name: entry.actorUser.name,
                email: entry.actorUser.email,
              }
            : null,
        }))}
      />
    </div>
  );
}
