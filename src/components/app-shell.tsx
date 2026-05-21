import { type Role } from "@prisma/client";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export function AppShell({
  children,
  user,
  branding,
}: {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
  branding: {
    organisationName: string;
    portalTitle: string;
    portalSubtitle: string;
  };
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{branding.organisationName}</p>
            <h1 className="text-2xl font-semibold">{branding.portalTitle}</h1>
            <p className="text-sm text-slate-500">{branding.portalSubtitle}</p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{user.name ?? user.email}</p>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{user.role}</p>
            </div>
            <SidebarNav role={user.role} />
          </div>

          <div className="mt-6">
            <SignOutButton />
          </div>
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">{children}</main>
      </div>
    </div>
  );
}
