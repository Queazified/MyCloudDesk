import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { deleteCloudPc, getCloudPcByIdForUser, updateCloudPc } from "@/lib/cloud-pcs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const cloudPc = await getCloudPcByIdForUser(id, user);

  if (!cloudPc) {
    return NextResponse.json({ error: "Cloud PC not found." }, { status: 404 });
  }

  return NextResponse.json({ cloudPc });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can update cloud PCs." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const payload = (await request.json()) as Record<string, unknown>;
    const cloudPc = await updateCloudPc(user, id, payload);
    return NextResponse.json({ cloudPc });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update the cloud PC." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can delete cloud PCs." }, { status: 403 });
  }

  try {
    const { id } = await params;
    await deleteCloudPc(user, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete the cloud PC." }, { status: 400 });
  }
}
