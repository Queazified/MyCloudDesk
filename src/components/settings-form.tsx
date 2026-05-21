"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SettingsRecord = {
  organisationName: string;
  portalTitle: string;
  portalSubtitle: string;
  supportEmail: string | null;
  remoteAccessMode: "NEW_TAB" | "EMBEDDED";
  sessionTimeoutMinutes: number;
  brandingPrimaryColor: string;
  adminRoleMappings: string;
};

export function SettingsForm({ settings }: { settings: SettingsRecord }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...settings,
    supportEmail: settings.supportEmail ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save settings.");
      }

      setMessage("Settings saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 p-5">
      {message ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Organisation name</span>
          <input value={form.organisationName} onChange={(event) => setForm((current) => ({ ...current, organisationName: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Portal title</span>
          <input value={form.portalTitle} onChange={(event) => setForm((current) => ({ ...current, portalTitle: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Portal subtitle</span>
          <input value={form.portalSubtitle} onChange={(event) => setForm((current) => ({ ...current, portalSubtitle: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Support email</span>
          <input value={form.supportEmail} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Primary brand colour</span>
          <div className="flex gap-3">
            <input type="color" value={form.brandingPrimaryColor} onChange={(event) => setForm((current) => ({ ...current, brandingPrimaryColor: event.target.value }))} className="h-11 w-14 rounded-lg border border-slate-300 bg-white p-1" />
            <input value={form.brandingPrimaryColor} onChange={(event) => setForm((current) => ({ ...current, brandingPrimaryColor: event.target.value }))} className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5" />
          </div>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Remote access mode</span>
          <select value={form.remoteAccessMode} onChange={(event) => setForm((current) => ({ ...current, remoteAccessMode: event.target.value as "NEW_TAB" | "EMBEDDED" }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5">
            <option value="NEW_TAB">Open remote access links in a new tab</option>
            <option value="EMBEDDED">Prefer the embedded view on the details page</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Session timeout (minutes)</span>
          <input type="number" min={15} max={720} value={form.sessionTimeoutMinutes} onChange={(event) => setForm((current) => ({ ...current, sessionTimeoutMinutes: Number(event.target.value) }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Admin role mapping emails</span>
          <textarea value={form.adminRoleMappings} onChange={(event) => setForm((current) => ({ ...current, adminRoleMappings: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
      </div>
      <div>
        <button type="submit" disabled={busy} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
          {busy ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
