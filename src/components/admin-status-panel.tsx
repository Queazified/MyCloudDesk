"use client";

import { CloudPcStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminStatusPanel({
  cloudPcId,
  currentStatus,
  maintenanceNotes,
  isEnabled,
}: {
  cloudPcId: string;
  currentStatus: CloudPcStatus;
  maintenanceNotes: string | null;
  isEnabled: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(maintenanceNotes ?? "");
  const [enabled, setEnabled] = useState(isEnabled);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);

    try {
      const response = await fetch(`/api/cloud-pcs/${cloudPcId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, maintenanceNotes: notes, isEnabled: enabled }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the cloud PC status.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to update the cloud PC status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold">Admin controls</h2>
      <p className="mt-1 text-sm text-slate-500">Change the current state, leave a note, or disable this cloud PC.</p>
      <div className="mt-4 grid gap-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as CloudPcStatus)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5">
            {Object.values(CloudPcStatus).map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Maintenance note</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-4 rounded border-slate-300" />
          Enable this cloud PC
        </label>
        <div>
          <button type="button" onClick={handleSave} disabled={busy} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {busy ? "Saving..." : "Save admin changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
