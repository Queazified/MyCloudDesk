import { CloudPcStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { updateCloudPcStatus } from "@/lib/cloud-pcs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can update cloud PC status." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const payload = (await request.json()) as {
      status: CloudPcStatus;
      maintenanceNotes?: string | null;
      isEnabled?: boolean;
    };

    const cloudPc = await updateCloudPcStatus(user, id, payload);
    return NextResponse.json({ cloudPc });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update status." }, { status: 400 });
  }
}
