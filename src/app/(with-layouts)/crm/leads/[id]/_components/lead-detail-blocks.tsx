import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDate, formatDateTime, formatVnd } from "@/lib/format";
import type { QuoteStatus } from "@/lib/lead-status";
import type { LeadDetail } from "@/server/lead/queries";
import { DepositForm } from "./deposit-form";
import { QuoteForm } from "./quote-form";

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Nháp",
  sent: "Đã gửi",
  accepted: "Đã duyệt",
};

const QUOTE_STATUS_COLOR: Record<QuoteStatus, "gray" | "sky" | "success"> = {
  draft: "gray",
  sent: "sky",
  accepted: "success",
};

function BlockCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-text-secondary">{text}</p>;
}

export function QuoteBlock({
  quotes,
  leadId,
  canManage,
}: {
  quotes: LeadDetail["quotes"];
  leadId: string;
  canManage: boolean;
}) {
  return (
    <BlockCard title="Báo giá">
      {quotes.length === 0 ? (
        <Empty text="Chưa có báo giá." />
      ) : (
        <div className="flex flex-col gap-5">
          {quotes.map((q) => (
            <div key={q.id} className="flex flex-col gap-2 border-b border-card-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <Badge color={QUOTE_STATUS_COLOR[q.status]} size="md">
                  {QUOTE_STATUS_LABELS[q.status]}
                </Badge>
                <span className="text-sm font-semibold text-text-primary">{formatVnd(q.total)}</span>
              </div>
              {q.items.length > 0 && (
                <ul className="flex flex-col gap-1 text-sm text-text-primary">
                  {q.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-4">
                      <span>
                        {it.name} × {it.quantity}
                      </span>
                      <span className="text-text-secondary">{formatVnd(it.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {q.note && <p className="text-sm text-text-secondary">{q.note}</p>}
            </div>
          ))}
        </div>
      )}
      {canManage && <QuoteForm leadId={leadId} />}
    </BlockCard>
  );
}

export function DepositBlock({
  deposits,
  leadId,
  canManage,
}: {
  deposits: LeadDetail["deposits"];
  leadId: string;
  canManage: boolean;
}) {
  return (
    <BlockCard title="Đặt cọc">
      {deposits.length === 0 ? (
        <Empty text="Chưa ghi nhận cọc." />
      ) : (
        <ul className="flex flex-col gap-3">
          {deposits.map((d) => (
            <li key={d.id} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">{formatVnd(d.amount)}</span>
                <span className="text-sm text-text-secondary">{formatDate(d.paidAt)}</span>
              </div>
              {(d.method || d.note) && (
                <p className="text-sm text-text-secondary">
                  {[d.method, d.note].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && <DepositForm leadId={leadId} />}
    </BlockCard>
  );
}

export function SurveyBlock({
  appointments,
  results,
}: {
  appointments: LeadDetail["appointments"];
  results: LeadDetail["results"];
}) {
  return (
    <BlockCard title="Khảo sát">
      {appointments.length === 0 && results.length === 0 ? (
        <Empty text="Chưa có lịch/kết quả khảo sát." />
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((a) => (
            <div key={a.id} className="text-sm text-text-primary">
              <p className="font-medium">{formatDateTime(a.scheduledAt)}</p>
              <p className="text-text-secondary">{a.address}</p>
              <p className="text-text-secondary">Kỹ thuật: {a.technicianName ?? "Chưa giao"}</p>
            </div>
          ))}

          {results.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 border-t border-card-border pt-3">
              {r.measurements.length > 0 && (
                <ul className="flex flex-col gap-1 text-sm text-text-primary">
                  {r.measurements.map((m, i) => (
                    <li key={i}>
                      <span className="font-medium">{m.area}</span>
                      <span className="text-text-secondary">
                        {" "}
                        — D{m.length ?? "?"} × R{m.width ?? "?"} × C{m.height ?? "?"}
                        {m.note ? ` · ${m.note}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {r.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm">
                  {r.photoUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-brand-color underline"
                    >
                      Ảnh {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </BlockCard>
  );
}

export function DesignBlock({ design }: { design: LeadDetail["design"] }) {
  return (
    <BlockCard title="Thiết kế 3D">
      {!design ? (
        <Empty text="Chưa có task thiết kế." />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-primary">
            Designer: {design.task.designerName ?? "Chưa giao"} · Số lần chỉnh sửa:{" "}
            {design.task.revisionCount}
          </p>
          {design.versions.length === 0 ? (
            <Empty text="Chưa có bản thiết kế." />
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {design.versions.map((v, i) => (
                <li key={v.id} className="flex flex-col gap-0.5">
                  <a
                    href={v.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-brand-color underline"
                  >
                    Bản #{design.versions.length - i} — {formatDateTime(v.createdAt)}
                  </a>
                  {v.note && <span className="text-text-secondary">{v.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </BlockCard>
  );
}
