import { type CloudPcStatus } from "@prisma/client";
import { statusMeta } from "@/lib/constants";

export function StatusBadge({ status }: { status: CloudPcStatus }) {
  const meta = statusMeta[status];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${meta.tone}`}>
      {meta.shortLabel}
    </span>
  );
}
