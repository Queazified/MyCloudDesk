"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConnectButton({
  cloudPcId,
  disabled,
  disabledReason,
}: {
  cloudPcId: string;
  disabled: boolean;
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    setBusy(true);

    try {
      const response = await fetch(`/api/cloud-pcs/${cloudPcId}/start-session`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to start the session.");
      }

      if (payload.openMode === "NEW_TAB") {
        window.open(payload.remoteUrl, "_blank", "noopener,noreferrer");
      } else {
        router.push(`/cloud-pcs/${cloudPcId}`);
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to start the session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={disabled || busy}
      title={disabled ? disabledReason ?? "Connection unavailable" : "Connect now"}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
    >
      {busy ? "Starting session..." : disabled ? "Unavailable" : "Connect"}
    </button>
  );
}
