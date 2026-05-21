import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { startCloudPcSession } from "@/lib/cloud-pcs";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const session = await startCloudPcSession(user, id);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start the session." }, { status: 400 });
  }
}
