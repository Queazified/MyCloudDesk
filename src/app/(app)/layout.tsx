import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";
import { getAppSettings } from "@/lib/settings";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireUser(), getAppSettings()]);

  return (
    <AppShell
      user={user}
      branding={{
        organisationName: settings.organisationName,
        portalTitle: settings.portalTitle,
        portalSubtitle: settings.portalSubtitle,
      }}
    >
      {children}
    </AppShell>
  );
}
