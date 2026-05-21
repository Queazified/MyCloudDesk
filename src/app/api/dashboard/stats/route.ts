import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { getDashboardData } from "@/lib/cloud-pcs";

export async function GET() {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const stats = await getDashboardData(user);
  return NextResponse.json(stats);
}
