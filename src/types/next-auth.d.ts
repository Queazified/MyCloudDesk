import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      provider?: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    provider?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    provider?: string | null;
  }
}
