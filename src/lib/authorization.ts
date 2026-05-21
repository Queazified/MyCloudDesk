import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export async function getOptionalUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getOptionalUser();

  if (!user?.id) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return user;
}
