"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";

const baseItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cloud-pcs", label: "Cloud PCs" },
  { href: "/history", label: "History" },
];

const adminItems = [
  { href: "/admin", label: "Admin" },
  { href: "/settings", label: "Settings" },
];

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === Role.ADMIN ? [...baseItems, ...adminItems] : baseItems;

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
