import { Role } from "@prisma/client";
import { CloudPcExplorer } from "@/components/cloud-pc-explorer";
import { requireUser } from "@/lib/authorization";
import { listCloudPcsForUser } from "@/lib/cloud-pcs";

export default async function CloudPcsPage() {
  const user = await requireUser();
  const cloudPcs = await listCloudPcsForUser(user);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Cloud PCs</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Available desktops at a glance</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Every cloud PC shows its current status, whether it is online, and why the connect button may be disabled.
        </p>
      </div>
      <CloudPcExplorer
        isAdmin={user.role === Role.ADMIN}
        cloudPcs={cloudPcs.map((cloudPc) => ({
          id: cloudPc.id,
          name: cloudPc.name,
          description: cloudPc.description,
          status: cloudPc.status,
          groupName: cloudPc.groupName,
          isEnabled: cloudPc.isEnabled,
          maintenanceNotes: cloudPc.maintenanceNotes,
          lastSeenAt: cloudPc.lastSeenAt?.toISOString() ?? null,
          lastOccupiedAt: cloudPc.lastOccupiedAt?.toISOString() ?? null,
          connectability: {
            allowed: cloudPc.connectability.allowed,
            reason: cloudPc.connectability.reason,
          },
          activeSession: cloudPc.activeSession
            ? {
                id: cloudPc.activeSession.id,
                startedAt: cloudPc.activeSession.startedAt.toISOString(),
                user: cloudPc.activeSession.user
                  ? {
                      name: cloudPc.activeSession.user.name,
                      email: cloudPc.activeSession.user.email,
                    }
                  : null,
              }
            : null,
        }))}
      />
    </div>
  );
}
