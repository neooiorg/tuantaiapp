import { LeadStatusBadge } from "@/components/crm/status-badge";
import { formatDateTime } from "@/lib/format";
import type { LeadDetail } from "@/server/lead/queries";

export function StatusTimeline({ histories }: { histories: LeadDetail["histories"] }) {
  if (histories.length === 0) {
    return <p className="text-sm text-text-secondary">Chưa có lịch sử.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {histories.map((h) => (
        <li key={h.id} className="flex gap-3">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-brand-color" />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {h.fromStatus && (
                <>
                  <LeadStatusBadge status={h.fromStatus} />
                  <span className="text-text-secondary">→</span>
                </>
              )}
              <LeadStatusBadge status={h.toStatus} />
            </div>
            <p className="text-xs text-text-secondary">
              {formatDateTime(h.createdAt)} · {h.userName ?? "Hệ thống"}
            </p>
            {h.note && <p className="text-sm text-text-primary">{h.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
