import { RemoteAccessMode, type AppSettings } from "@prisma/client";
import prisma from "@/lib/prisma";
import { APP_NAME, APP_TAGLINE, DEFAULT_SUPPORT_EMAIL } from "@/lib/constants";
import { parseCommaSeparatedList } from "@/lib/utils";

export async function getAppSettings() {
  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      organisationName: "Queazified",
      portalTitle: APP_NAME,
      portalSubtitle: APP_TAGLINE,
      supportEmail: DEFAULT_SUPPORT_EMAIL,
      remoteAccessMode: RemoteAccessMode.NEW_TAB,
      sessionTimeoutMinutes: 480,
      brandingPrimaryColor: "#2563eb",
      adminRoleMappings: "admin@queazified.co.uk",
    },
  });

  return settings;
}

export function getAdminEmails(settings: Pick<AppSettings, "adminRoleMappings">) {
  return [
    ...new Set(
      [
        ...parseCommaSeparatedList(settings.adminRoleMappings),
        ...parseCommaSeparatedList(process.env.ADMIN_EMAILS ?? "admin@queazified.co.uk"),
      ].filter(Boolean),
    ),
  ];
}
