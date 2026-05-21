import { AccessPolicy, CloudPcStatus, PrismaClient, RemoteAccessMode, Role, SessionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cloudPC.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSettings.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Queazified Admin",
      email: "admin@queazified.co.uk",
      role: Role.ADMIN,
      provider: "mock",
      providerAccountId: "admin@queazified.co.uk",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Queazified User",
      email: "user@queazified.co.uk",
      role: Role.USER,
      provider: "mock",
      providerAccountId: "user@queazified.co.uk",
    },
  });

  await prisma.appSettings.create({
    data: {
      id: "default",
      organisationName: "Queazified",
      portalTitle: "MyCloudDesk",
      portalSubtitle: "Access your Queazified cloud desktop",
      supportEmail: "support@queazified.co.uk",
      remoteAccessMode: RemoteAccessMode.NEW_TAB,
      sessionTimeoutMinutes: 480,
      brandingPrimaryColor: "#2563eb",
      adminRoleMappings: "admin@queazified.co.uk",
    },
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const cloudPcs = await prisma.$transaction([
    prisma.cloudPC.create({
      data: {
        name: "QZ-CloudPC-01",
        description: "Primary available cloud desktop for general work.",
        status: CloudPcStatus.AVAILABLE,
        remoteUrl: "https://guac.example.com/#/client/QZ-CloudPC-01",
        lastSeenAt: now,
        groupName: "General Access",
        isEnabled: true,
        accessPolicy: AccessPolicy.ALL_USERS,
      },
    }),
    prisma.cloudPC.create({
      data: {
        name: "QZ-CloudPC-02",
        description: "Currently occupied for an active user session.",
        status: CloudPcStatus.OCCUPIED,
        remoteUrl: "https://guac.example.com/#/client/QZ-CloudPC-02",
        lastSeenAt: now,
        groupName: "General Access",
        isEnabled: true,
        accessPolicy: AccessPolicy.ALL_USERS,
      },
    }),
    prisma.cloudPC.create({
      data: {
        name: "QZ-CloudPC-03",
        description: "Offline while the host is unreachable.",
        status: CloudPcStatus.OFFLINE,
        remoteUrl: "https://guac.example.com/#/client/QZ-CloudPC-03",
        lastSeenAt: yesterday,
        groupName: "Creative Team",
        isEnabled: true,
        accessPolicy: AccessPolicy.ALL_USERS,
      },
    }),
    prisma.cloudPC.create({
      data: {
        name: "QZ-CloudPC-04",
        description: "Reserved for planned maintenance work.",
        status: CloudPcStatus.MAINTENANCE,
        remoteUrl: "https://guac.example.com/#/client/QZ-CloudPC-04",
        lastSeenAt: yesterday,
        groupName: "Engineering",
        isEnabled: true,
        maintenanceNotes: "Monthly patching window.",
        accessPolicy: AccessPolicy.ALL_USERS,
      },
    }),
    prisma.cloudPC.create({
      data: {
        name: "QZ-CloudPC-05",
        description: "Temporarily unavailable due to a known issue.",
        status: CloudPcStatus.REPAIR,
        remoteUrl: "https://guac.example.com/#/client/QZ-CloudPC-05",
        lastSeenAt: yesterday,
        groupName: "Design",
        isEnabled: false,
        maintenanceNotes: "Awaiting graphics driver replacement.",
        accessPolicy: AccessPolicy.ADMINS_ONLY,
      },
    }),
  ]);

  await prisma.session.createMany({
    data: [
      {
        cloudPcId: cloudPcs[1].id,
        userId: user.id,
        startedAt: oneHourAgo,
        status: SessionStatus.ACTIVE,
      },
      {
        cloudPcId: cloudPcs[0].id,
        userId: admin.id,
        startedAt: threeHoursAgo,
        endedAt: twoHoursAgo,
        durationSeconds: 3600,
        status: SessionStatus.ENDED,
        endReason: "User ended the session normally.",
      },
      {
        cloudPcId: cloudPcs[2].id,
        userId: user.id,
        startedAt: yesterday,
        endedAt: new Date(yesterday.getTime() + 45 * 60 * 1000),
        durationSeconds: 2700,
        status: SessionStatus.ERROR,
        endReason: "Session ended because the cloud PC went offline.",
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: admin.id,
        action: "SEED_CREATED_CLOUD_PCS",
        targetType: "system",
        targetId: "seed",
        metadata: { count: cloudPcs.length },
      },
      {
        actorUserId: user.id,
        action: "SESSION_STARTED",
        targetType: "session",
        targetId: cloudPcs[1].id,
        metadata: { cloudPcName: cloudPcs[1].name },
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
