"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { formatVnd } from "@/lib/format";
import { createQuoteAction } from "@/server/lead/quote-deposit-actions";

type Row = { name: string; quantity: string; unitPrice: string };

const emptyRow = (): Row => ({ name: "", quantity: "1", unitPrice: "0" });

const inputClass = "w-full px-3 py-2 text-sm";
const labelClass = "text-xs text-text-secondary";

export function QuoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const total = rows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0),
    0,
  );

  function updateRow(index: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function submit() {
    const items = rows
      .map((r) => ({ name: r.name.trim(), quantity: Number(r.quantity), unitPrice: Number(r.unitPrice) }))
      .filter((it) => it.name && it.quantity > 0);

    if (items.length === 0) {
      toast.error("Nhập ít nhất một hạng mục hợp lệ.");
      return;
    }

    startTransition(async () => {
      const res = await createQuoteAction(leadId, items, note || undefined);
      if (res.ok) {
        toast.success("Đã tạo báo giá.");
        setRows([emptyRow()]);
        setNote("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-card-border pt-4">
      <p className="text-sm font-medium text-text-primary">Thêm báo giá</p>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-end gap-2">
            <TextField
              aria-label="Tên hạng mục"
              value={row.name}
              onChange={(v) => updateRow(i, "name", v)}
              className="flex-1 flex-col gap-1"
            >
              <Label className={labelClass}>Hạng mục</Label>
              <Input placeholder="VD: Tủ bếp gỗ sồi" className={inputClass} />
            </TextField>

            <TextField
              aria-label="Số lượng"
              value={row.quantity}
              onChange={(v) => updateRow(i, "quantity", v)}
              className="w-20 flex-col gap-1"
            >
              <Label className={labelClass}>SL</Label>
              <Input type="number" min={0} className={inputClass} />
            </TextField>

            <TextField
              aria-label="Đơn giá"
              value={row.unitPrice}
              onChange={(v) => updateRow(i, "unitPrice", v)}
              className="w-36 flex-col gap-1"
            >
              <Label className={labelClass}>Đơn giá</Label>
              <Input type="number" min={0} className={inputClass} />
            </TextField>

            <Button
              variant="danger"
              appearance="outline"
              size="sm"
              isDisabled={rows.length === 1}
              onPress={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
            >
              Xoá
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Button
          variant="primary"
          appearance="outline"
          size="sm"
          onPress={() => setRows((prev) => [...prev, emptyRow()])}
        >
          + Thêm dòng
        </Button>
      </div>

      <TextField value={note} onChange={setNote} className="w-full flex-col gap-1.5">
        <Label className={labelClass}>Ghi chú</Label>
        <TextArea placeholder="Ghi chú báo giá (không bắt buộc)" />
      </TextField>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">Tổng: {formatVnd(total)}</span>
        <Button variant="primary" appearance="fill" size="md" isDisabled={pending} onPress={submit}>
          Lưu báo giá
        </Button>
      </div>
    </div>
  );
}
