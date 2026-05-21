import { NextResponse } from "next/server";
import { RemoteAccessMode } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getOptionalUser } from "@/lib/authorization";
import { createAuditLog } from "@/lib/audit";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can view settings." }, { status: 403 });
  }

  const settings = await getAppSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can update settings." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as {
      organisationName: string;
      portalTitle: string;
      portalSubtitle: string;
      supportEmail?: string | null;
      remoteAccessMode: RemoteAccessMode;
      sessionTimeoutMinutes: number;
      brandingPrimaryColor: string;
      adminRoleMappings: string;
    };

    const settings = await prisma.appSettings.upsert({
      where: { id: "default" },
      update: {
        organisationName: payload.organisationName.trim(),
        portalTitle: payload.portalTitle.trim(),
        portalSubtitle: payload.portalSubtitle.trim(),
        supportEmail: payload.supportEmail?.trim() || null,
        remoteAccessMode: payload.remoteAccessMode,
        sessionTimeoutMinutes: Number(payload.sessionTimeoutMinutes),
        brandingPrimaryColor: payload.brandingPrimaryColor.trim(),
        adminRoleMappings: payload.adminRoleMappings.trim(),
      },
      create: {
        id: "default",
        organisationName: payload.organisationName.trim(),
        portalTitle: payload.portalTitle.trim(),
        portalSubtitle: payload.portalSubtitle.trim(),
        supportEmail: payload.supportEmail?.trim() || null,
        remoteAccessMode: payload.remoteAccessMode,
        sessionTimeoutMinutes: Number(payload.sessionTimeoutMinutes),
        brandingPrimaryColor: payload.brandingPrimaryColor.trim(),
        adminRoleMappings: payload.adminRoleMappings.trim(),
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      action: "SETTINGS_UPDATED",
      targetType: "settings",
      targetId: settings.id,
      metadata: {
        remoteAccessMode: settings.remoteAccessMode,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update settings." }, { status: 400 });
  }
}
