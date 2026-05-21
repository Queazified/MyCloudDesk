import {
  AccessPolicy,
  CloudPcStatus,
  type Prisma,
  RemoteAccessMode,
  Role,
  SessionStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { getConnectability } from "@/lib/permissions";
import { getAppSettings } from "@/lib/settings";
import { toBoolean, toNullableString } from "@/lib/utils";

export type AppUser = {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
};

const sessionInclude = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
  orderBy: {
    startedAt: "desc",
  },
  take: 8,
} satisfies Prisma.SessionFindManyArgs;

function getHistoryEntry(sessions: Array<{ status: SessionStatus; startedAt: Date }>) {
  return sessions.find((session) => session.status !== SessionStatus.ACTIVE) ?? sessions[0] ?? null;
}

function serializeCloudPcForRole(cloudPc: Prisma.CloudPCGetPayload<{ include: { sessions: typeof sessionInclude } }>, user: AppUser) {
  const activeSession = cloudPc.sessions.find((session) => session.status === SessionStatus.ACTIVE) ?? null;
  const lastOccupiedSession = getHistoryEntry(cloudPc.sessions);
  const connectability = getConnectability({
    status: cloudPc.status,
    isEnabled: cloudPc.isEnabled,
    accessPolicy: cloudPc.accessPolicy,
    requesterRole: user.role,
    requesterId: user.id,
    activeUserId: activeSession?.userId,
  });

  return {
    ...cloudPc,
    activeSession:
      activeSession && (user.role === Role.ADMIN || activeSession.userId === user.id)
        ? activeSession
        : activeSession
          ? {
              id: activeSession.id,
              startedAt: activeSession.startedAt,
              status: activeSession.status,
              userId: activeSession.userId,
              user: null,
            }
          : null,
    lastOccupiedAt: lastOccupiedSession?.startedAt ?? null,
    connectability,
  };
}

export async function listCloudPcsForUser(user: AppUser) {
  const cloudPcs = await prisma.cloudPC.findMany({
    include: {
      sessions: sessionInclude,
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return cloudPcs.map((cloudPc) => serializeCloudPcForRole(cloudPc, user));
}

export async function getCloudPcByIdForUser(id: string, user: AppUser) {
  const cloudPc = await prisma.cloudPC.findUnique({
    where: { id },
    include: {
      sessions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!cloudPc) {
    return null;
  }

  return serializeCloudPcForRole(cloudPc, user);
}

export async function getDashboardData(user: AppUser) {
  const cloudPcs = await listCloudPcsForUser(user);
  const history = await prisma.session.findMany({
    where: user.role === Role.ADMIN ? {} : { userId: user.id },
    include: {
      cloudPc: true,
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 8,
  });

  const totals = cloudPcs.reduce(
    (summary, cloudPc) => {
      summary.total += 1;
      summary[cloudPc.status] += 1;
      return summary;
    },
    {
      total: 0,
      AVAILABLE: 0,
      OCCUPIED: 0,
      OFFLINE: 0,
      MAINTENANCE: 0,
      REPAIR: 0,
    },
  );

  return {
    totals,
    availableNow: cloudPcs.filter((cloudPc) => cloudPc.status === CloudPcStatus.AVAILABLE && cloudPc.connectability.allowed),
    recentActivity: history,
  };
}

export async function getHistoryData(
  user: AppUser,
  filters: {
    from?: string;
    to?: string;
    cloudPcId?: string;
    status?: SessionStatus | "ALL";
    userEmail?: string;
  },
) {
  const sessions = await prisma.session.findMany({
    where: {
      ...(user.role === Role.ADMIN ? {} : { userId: user.id }),
      ...(filters.cloudPcId ? { cloudPcId: filters.cloudPcId } : {}),
      ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
      ...(filters.from ? { startedAt: { gte: new Date(filters.from) } } : {}),
      ...(filters.to ? { startedAt: { lte: new Date(`${filters.to}T23:59:59.999Z`) } } : {}),
      ...(filters.userEmail && user.role === Role.ADMIN
        ? {
            user: {
              email: {
                contains: filters.userEmail,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
    include: {
      cloudPc: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 100,
  });

  return sessions;
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      actorUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

export async function getAdminPageData() {
  const [cloudPcs, activeSessions, auditLogs] = await Promise.all([
    prisma.cloudPC.findMany({
      include: {
        sessions: sessionInclude,
      },
      orderBy: { name: "asc" },
    }),
    prisma.session.findMany({
      where: { status: SessionStatus.ACTIVE },
      include: {
        cloudPc: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { startedAt: "asc" },
    }),
    getAuditLogs(),
  ]);

  return { cloudPcs, activeSessions, auditLogs };
}

function parseCloudPcPayload(payload: Record<string, unknown>) {
  const name = String(payload.name ?? "").trim();
  const remoteUrl = String(payload.remoteUrl ?? "").trim();

  if (!name) {
    throw new Error("Please enter a cloud PC name.");
  }

  if (!remoteUrl) {
    throw new Error("Please provide a remote access URL.");
  }

  const status = String(payload.status ?? CloudPcStatus.OFFLINE) as CloudPcStatus;
  const allowedStatuses = Object.values(CloudPcStatus);
  if (!allowedStatuses.includes(status)) {
    throw new Error("Please choose a valid cloud PC status.");
  }

  const accessPolicy = String(payload.accessPolicy ?? AccessPolicy.ALL_USERS) as AccessPolicy;
  if (!Object.values(AccessPolicy).includes(accessPolicy)) {
    throw new Error("Please choose a valid access rule.");
  }

  return {
    name,
    description: toNullableString(payload.description),
    status,
    remoteUrl,
    lastSeenAt: status === CloudPcStatus.OFFLINE ? null : new Date(),
    groupName: toNullableString(payload.groupName),
    isEnabled: toBoolean(payload.isEnabled),
    maintenanceNotes: toNullableString(payload.maintenanceNotes),
    accessPolicy,
  } satisfies Prisma.CloudPCUncheckedCreateInput;
}

function getCloudPcAvailabilityAfterSession(cloudPc: {
  status: CloudPcStatus;
  isEnabled: boolean;
}) {
  if (!cloudPc.isEnabled) {
    return CloudPcStatus.OFFLINE;
  }

  if (cloudPc.status === CloudPcStatus.OCCUPIED) {
    return CloudPcStatus.AVAILABLE;
  }

  return cloudPc.status;
}

export async function createCloudPc(user: AppUser, payload: Record<string, unknown>) {
  const data = parseCloudPcPayload(payload);
  const cloudPc = await prisma.cloudPC.create({ data });

  await createAuditLog({
    actorUserId: user.id,
    action: "CLOUD_PC_CREATED",
    targetType: "cloud-pc",
    targetId: cloudPc.id,
    metadata: { name: cloudPc.name },
  });

  return cloudPc;
}

export async function updateCloudPc(user: AppUser, id: string, payload: Record<string, unknown>) {
  const existing = await prisma.cloudPC.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { status: SessionStatus.ACTIVE },
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new Error("Cloud PC not found.");
  }

  const data = parseCloudPcPayload(payload);

  if (existing.sessions.length > 0 && data.status !== CloudPcStatus.OCCUPIED) {
    throw new Error("Force end the active session before changing this cloud PC to a different status.");
  }

  const updated = await prisma.cloudPC.update({
    where: { id },
    data,
  });

  await createAuditLog({
    actorUserId: user.id,
    action: "CLOUD_PC_UPDATED",
    targetType: "cloud-pc",
    targetId: updated.id,
    metadata: { name: updated.name, status: updated.status },
  });

  return updated;
}

export async function updateCloudPcStatus(
  user: AppUser,
  id: string,
  payload: { status: CloudPcStatus; maintenanceNotes?: string | null; isEnabled?: boolean },
) {
  const existing = await prisma.cloudPC.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { status: SessionStatus.ACTIVE },
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new Error("Cloud PC not found.");
  }

  if (existing.sessions.length > 0 && payload.status !== CloudPcStatus.OCCUPIED) {
    throw new Error("Force end the active session before changing this cloud PC status.");
  }

  const updated = await prisma.cloudPC.update({
    where: { id },
    data: {
      status: payload.status,
      maintenanceNotes: payload.maintenanceNotes ?? existing.maintenanceNotes,
      isEnabled: typeof payload.isEnabled === "boolean" ? payload.isEnabled : existing.isEnabled,
      lastSeenAt: payload.status === CloudPcStatus.OFFLINE ? existing.lastSeenAt : new Date(),
    },
  });

  await createAuditLog({
    actorUserId: user.id,
    action: "CLOUD_PC_STATUS_UPDATED",
    targetType: "cloud-pc",
    targetId: updated.id,
    metadata: { status: updated.status },
  });

  return updated;
}

export async function deleteCloudPc(user: AppUser, id: string) {
  const existing = await prisma.cloudPC.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { status: SessionStatus.ACTIVE },
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new Error("Cloud PC not found.");
  }

  if (existing.sessions.length > 0) {
    throw new Error("Force end the active session before deleting this cloud PC.");
  }

  await prisma.cloudPC.delete({ where: { id } });

  await createAuditLog({
    actorUserId: user.id,
    action: "CLOUD_PC_DELETED",
    targetType: "cloud-pc",
    targetId: id,
    metadata: { name: existing.name },
  });
}

export async function startCloudPcSession(user: AppUser, cloudPcId: string) {
  const settings = await getAppSettings();

  const result = await prisma.$transaction(async (tx) => {
    const cloudPc = await tx.cloudPC.findUnique({
      where: { id: cloudPcId },
      include: {
        sessions: {
          where: { status: SessionStatus.ACTIVE },
          take: 1,
        },
      },
    });

    if (!cloudPc) {
      throw new Error("Cloud PC not found.");
    }

    const evaluation = getConnectability({
      status: cloudPc.status,
      isEnabled: cloudPc.isEnabled,
      accessPolicy: cloudPc.accessPolicy,
      requesterRole: user.role,
      requesterId: user.id,
      activeUserId: cloudPc.sessions[0]?.userId,
    });

    if (!evaluation.allowed) {
      throw new Error(evaluation.reason ?? "This cloud PC cannot be connected right now.");
    }

    const session = await tx.session.create({
      data: {
        cloudPcId: cloudPc.id,
        userId: user.id,
        status: SessionStatus.ACTIVE,
      },
    });

    await tx.cloudPC.update({
      where: { id: cloudPc.id },
      data: {
        status: CloudPcStatus.OCCUPIED,
        lastSeenAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "SESSION_STARTED",
        targetType: "session",
        targetId: session.id,
        metadata: {
          cloudPcId: cloudPc.id,
          cloudPcName: cloudPc.name,
        },
      },
    });

    return {
      sessionId: session.id,
      remoteUrl: cloudPc.remoteUrl,
      cloudPcName: cloudPc.name,
    };
  });

  return {
    ...result,
    openMode: settings.remoteAccessMode,
  } satisfies {
    sessionId: string;
    remoteUrl: string;
    cloudPcName: string;
    openMode: RemoteAccessMode;
  };
}

async function endSessionInternal({
  actor,
  sessionId,
  force,
}: {
  actor: AppUser;
  sessionId: string;
  force: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: {
        cloudPc: true,
        user: true,
      },
    });

    if (!session || session.status !== SessionStatus.ACTIVE) {
      throw new Error("This session is no longer active.");
    }

    if (!force && actor.role !== Role.ADMIN && session.userId !== actor.id) {
      throw new Error("You can only end your own sessions.");
    }

    const endedAt = new Date();
    const durationSeconds = Math.max(0, Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000));
    const nextStatus = force ? SessionStatus.FORCE_ENDED : SessionStatus.ENDED;

    await tx.session.update({
      where: { id: session.id },
      data: {
        endedAt,
        durationSeconds,
        status: nextStatus,
        endReason: force ? "Session was force ended by an administrator." : "User ended the session normally.",
      },
    });

    await tx.cloudPC.update({
      where: { id: session.cloudPcId },
      data: {
        status: getCloudPcAvailabilityAfterSession(session.cloudPc),
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: force ? "SESSION_FORCE_ENDED" : "SESSION_ENDED",
        targetType: "session",
        targetId: session.id,
        metadata: {
          cloudPcId: session.cloudPcId,
          cloudPcName: session.cloudPc.name,
        },
      },
    });
  });
}

export async function endCloudPcSession(actor: AppUser, sessionId: string) {
  await endSessionInternal({ actor, sessionId, force: false });
}

export async function forceEndCloudPcSession(actor: AppUser, sessionId: string) {
  await endSessionInternal({ actor, sessionId, force: true });
}
