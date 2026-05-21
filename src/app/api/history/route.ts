import { NextResponse } from "next/server";
import { SessionStatus } from "@prisma/client";
import { getOptionalUser } from "@/lib/authorization";
import { getHistoryData } from "@/lib/cloud-pcs";

export async function GET(request: Request) {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const history = await getHistoryData(user, {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    cloudPcId: searchParams.get("cloudPcId") ?? undefined,
    status: (searchParams.get("status") as SessionStatus | "ALL" | null) ?? "ALL",
    userEmail: searchParams.get("userEmail") ?? undefined,
  });

  return NextResponse.json({ history });
}
