"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { formatVnd } from "@/lib/format";
import type { QuoteStatus } from "@/lib/lead-status";
import type { LeadDetail } from "@/server/lead/queries";
import { deleteQuoteAction } from "@/server/lead/quote-deposit-actions";
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

type Quote = LeadDetail["quotes"][number];

export function QuotesManager({
  quotes,
  leadId,
  canManage,
}: {
  quotes: Quote[];
  leadId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const res = await deleteQuoteAction(id);
      if (res.ok) {
        toast.success("Đã xoá báo giá.");
        setDeleting(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      {quotes.length === 0 ? (
        <p className="text-sm text-text-secondary">Chưa có báo giá.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {quotes.map((q) =>
            editingId === q.id ? (
              <QuoteForm
                key={q.id}
                leadId={leadId}
                initial={{
                  quoteId: q.id,
                  note: q.note,
                  items: q.items.map((it) => ({
                    name: it.name,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                  })),
                }}
                onDone={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={q.id}
                className="flex flex-col gap-2 border-b border-card-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <Badge color={QUOTE_STATUS_COLOR[q.status]} size="md">
                    {QUOTE_STATUS_LABELS[q.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatVnd(q.total)}
                  </span>
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
                {q.note && <p className="text-sm whitespace-pre-line text-text-secondary">{q.note}</p>}
                {canManage && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      appearance="outline"
                      size="sm"
                      onPress={() => setEditingId(q.id)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      appearance="outline"
                      size="sm"
                      onPress={() => setDeleting(q)}
                    >
                      Xoá
                    </Button>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

      {canManage && !editingId && <QuoteForm leadId={leadId} />}

      <Dialog isOpen={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>Xoá báo giá</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-text-secondary">
          Xoá báo giá <b className="text-text-primary">{deleting && formatVnd(deleting.total)}</b>? Hành
          động này không thể hoàn tác.
        </div>
        <DialogFooter>
          <Button variant="ghost" size="md" isDisabled={pending} onPress={() => setDeleting(null)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            appearance="fill"
            size="md"
            isDisabled={pending}
            onPress={confirmDelete}
          >
            Xoá
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
