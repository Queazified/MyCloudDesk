import assert from "node:assert/strict";
import test from "node:test";
import { AccessPolicy, CloudPcStatus, Role } from "@prisma/client";
import { getConnectability } from "@/lib/permissions";

test("available cloud PCs can be connected to", () => {
  const result = getConnectability({
    status: CloudPcStatus.AVAILABLE,
    isEnabled: true,
    accessPolicy: AccessPolicy.ALL_USERS,
    requesterRole: Role.USER,
  });

  assert.equal(result.allowed, true);
});

test("admins only policy blocks standard users", () => {
  const result = getConnectability({
    status: CloudPcStatus.AVAILABLE,
    isEnabled: true,
    accessPolicy: AccessPolicy.ADMINS_ONLY,
    requesterRole: Role.USER,
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason ?? "", /Only administrators/);
});

test("occupied cloud PCs explain why connection is disabled", () => {
  const result = getConnectability({
    status: CloudPcStatus.OCCUPIED,
    isEnabled: true,
    accessPolicy: AccessPolicy.ALL_USERS,
    requesterRole: Role.USER,
    requesterId: "user-1",
    activeUserId: "user-2",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "This cloud PC is currently occupied.");
});
