import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/authorization";
import { getAuditLogs } from "@/lib/cloud-pcs";

export async function GET() {
  const user = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can view audit logs." }, { status: 403 });
  }

  const auditLogs = await getAuditLogs();
  return NextResponse.json({ auditLogs });
}
