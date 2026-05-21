import { AccessPolicy, CloudPcStatus, Role } from "@prisma/client";

export type ConnectabilityInput = {
  status: CloudPcStatus;
  isEnabled: boolean;
  accessPolicy: AccessPolicy;
  requesterRole: Role;
  requesterId?: string | null;
  activeUserId?: string | null;
};

export function getConnectability(input: ConnectabilityInput) {
  if (!input.isEnabled) {
    return {
      allowed: false,
      reason: "This cloud PC is disabled by an administrator.",
    };
  }

  if (input.accessPolicy === AccessPolicy.ADMINS_ONLY && input.requesterRole !== Role.ADMIN) {
    return {
      allowed: false,
      reason: "Only administrators can connect to this cloud PC.",
    };
  }

  switch (input.status) {
    case CloudPcStatus.AVAILABLE:
      return { allowed: true, reason: null };
    case CloudPcStatus.OCCUPIED:
      return {
        allowed: false,
        reason:
          input.activeUserId && input.activeUserId === input.requesterId
            ? "You already have an active session on this cloud PC."
            : "This cloud PC is currently occupied.",
      };
    case CloudPcStatus.OFFLINE:
      return { allowed: false, reason: "This cloud PC is offline right now." };
    case CloudPcStatus.MAINTENANCE:
      return {
        allowed: false,
        reason: "This cloud PC is in maintenance mode.",
      };
    case CloudPcStatus.REPAIR:
      return {
        allowed: false,
        reason: "This cloud PC is under repair.",
      };
    default:
      return {
        allowed: false,
        reason: "This cloud PC cannot be used right now.",
      };
  }
}
