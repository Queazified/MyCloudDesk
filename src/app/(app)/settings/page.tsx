import { SettingsForm } from "@/components/settings-form";
import { getLoginProviders } from "@/lib/auth";
import { requireAdmin } from "@/lib/authorization";
import { getAppSettings } from "@/lib/settings";

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, providers] = await Promise.all([getAppSettings(), Promise.resolve(getLoginProviders())]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Portal configuration</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Manage the branding and operational settings stored in the app, and review how sign-in providers are configured.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">SSO providers</h2>
          <p className="mt-1 text-sm text-slate-500">Configured providers from environment variables.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {providers.length === 0 ? <li>No providers configured yet.</li> : providers.map((provider) => <li key={provider.id}>{provider.name}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Remote access provider</h2>
          <p className="mt-1 text-sm text-slate-500">Cloud PCs launch their configured remote URLs using the selected open mode.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Admin role mapping</h2>
          <p className="mt-1 text-sm text-slate-500">Users whose email addresses match the configured mapping are treated as admins on sign-in.</p>
        </div>
      </div>

      <SettingsForm
        settings={{
          organisationName: settings.organisationName,
          portalTitle: settings.portalTitle,
          portalSubtitle: settings.portalSubtitle,
          supportEmail: settings.supportEmail,
          remoteAccessMode: settings.remoteAccessMode,
          sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
          brandingPrimaryColor: settings.brandingPrimaryColor,
          adminRoleMappings: settings.adminRoleMappings,
        }}
      />
    </div>
  );
}
