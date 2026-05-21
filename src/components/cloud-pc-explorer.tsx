"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type CloudPcStatus } from "@prisma/client";
import { ConnectButton } from "@/components/connect-button";
import { StatusBadge } from "@/components/status-badge";
import { statusFilters } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

type CloudPcCardData = {
  id: string;
  name: string;
  description: string | null;
  status: CloudPcStatus;
  groupName: string | null;
  isEnabled: boolean;
  maintenanceNotes: string | null;
  lastSeenAt: string | null;
  lastOccupiedAt: string | null;
  connectability: {
    allowed: boolean;
    reason: string | null;
  };
  activeSession: {
    id: string;
    startedAt: string;
    user: { name: string | null; email: string | null } | null;
  } | null;
};

export function CloudPcExplorer({
  cloudPcs,
  isAdmin,
}: {
  cloudPcs: CloudPcCardData[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("ALL");

  const filtered = useMemo(() => {
    return cloudPcs.filter((cloudPc) => {
      const matchesFilter = filter === "ALL" ? true : cloudPc.status === filter;
      const matchesSearch = cloudPc.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cloudPcs, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Find a cloud PC</h2>
          <p className="mt-1 text-sm text-slate-500">Search by name or filter by status to find the right desktop quickly.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by cloud PC name"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as (typeof statusFilters)[number])}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No cloud PCs match your current search and filter.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((cloudPc) => (
            <article key={cloudPc.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{cloudPc.name}</h3>
                    <StatusBadge status={cloudPc.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{cloudPc.description ?? "No description added yet."}</p>
                </div>
                <ConnectButton
                  cloudPcId={cloudPc.id}
                  disabled={!cloudPc.connectability.allowed}
                  disabledReason={cloudPc.connectability.reason}
                />
              </div>

              <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-900">Group</dt>
                  <dd className="mt-1">{cloudPc.groupName ?? "Not assigned"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Last seen online</dt>
                  <dd className="mt-1">{formatDateTime(cloudPc.lastSeenAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Last occupied</dt>
                  <dd className="mt-1">{formatDateTime(cloudPc.lastOccupiedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Availability</dt>
                  <dd className="mt-1">{cloudPc.connectability.allowed ? "Ready to connect" : cloudPc.connectability.reason ?? "Unavailable"}</dd>
                </div>
                {isAdmin ? (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-900">Current occupant</dt>
                    <dd className="mt-1">
                      {cloudPc.activeSession?.user
                        ? `${cloudPc.activeSession.user.name ?? cloudPc.activeSession.user.email} • since ${formatDateTime(cloudPc.activeSession.startedAt)}`
                        : cloudPc.status === "OCCUPIED"
                          ? "Hidden or unknown"
                          : "No active session"}
                    </dd>
                  </div>
                ) : null}
                {cloudPc.maintenanceNotes ? (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-900">Admin note</dt>
                    <dd className="mt-1">{cloudPc.maintenanceNotes}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  {cloudPc.isEnabled ? "Enabled" : "Disabled"}
                </p>
                <Link href={`/cloud-pcs/${cloudPc.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
