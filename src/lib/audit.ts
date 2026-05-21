import prisma from "@/lib/prisma";

export async function createAuditLog({
  actorUserId,
  action,
  targetType,
  targetId,
  metadata,
}: {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: actorUserId ?? null,
      action,
      targetType,
      targetId,
      metadata: metadata as object | undefined,
    },
  });
}
