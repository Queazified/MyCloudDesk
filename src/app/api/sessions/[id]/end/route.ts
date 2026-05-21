import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { endCloudPcSession } from "@/lib/cloud-pcs";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await endCloudPcSession(user, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to end the session." }, { status: 400 });
  }
}
