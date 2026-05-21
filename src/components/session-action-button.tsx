"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SessionActionButton({
  endpoint,
  label,
  confirmMessage,
  tone = "neutral",
}: {
  endpoint: string;
  label: string;
  confirmMessage?: string;
  tone?: "neutral" | "danger";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "The request could not be completed.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        tone === "danger"
          ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {busy ? "Working..." : label}
    </button>
  );
}
