import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { createCloudPc, listCloudPcsForUser } from "@/lib/cloud-pcs";

export async function GET() {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const cloudPcs = await listCloudPcsForUser(user);
  return NextResponse.json({ cloudPcs });
}

export async function POST(request: Request) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can add cloud PCs." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const cloudPc = await createCloudPc(user, payload);
    return NextResponse.json({ cloudPc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create the cloud PC." }, { status: 400 });
  }
}
