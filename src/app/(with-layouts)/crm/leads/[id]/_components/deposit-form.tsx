"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { recordDepositAction } from "@/server/lead/quote-deposit-actions";

const inputClass = "w-full px-3 py-2 text-sm";
const labelClass = "text-xs text-text-secondary";

export function DepositForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!(Number(amount) > 0)) {
      toast.error("Số tiền cọc phải lớn hơn 0.");
      return;
    }
    if (!paidAt) {
      toast.error("Chọn ngày cọc.");
      return;
    }

    startTransition(async () => {
      const res = await recordDepositAction(leadId, {
        amount: Number(amount),
        paidAt,
        method: method || undefined,
        note: note || undefined,
      });
      if (res.ok) {
        toast.success("Đã ghi nhận cọc.");
        setAmount("");
        setMethod("");
        setNote("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-card-border pt-4">
      <p className="text-sm font-medium text-text-primary">Ghi nhận cọc</p>

      <div className="flex flex-wrap gap-2">
        <TextField
          aria-label="Số tiền cọc"
          value={amount}
          onChange={setAmount}
          className="w-40 flex-col gap-1"
        >
          <Label className={labelClass}>Số tiền</Label>
          <Input type="number" min={0} placeholder="VD: 5000000" className={inputClass} />
        </TextField>

        <TextField
          aria-label="Ngày cọc"
          value={paidAt}
          onChange={setPaidAt}
          className="w-44 flex-col gap-1"
        >
          <Label className={labelClass}>Ngày cọc</Label>
          <Input type="date" className={inputClass} />
        </TextField>

        <TextField
          aria-label="Phương thức"
          value={method}
          onChange={setMethod}
          className="w-44 flex-col gap-1"
        >
          <Label className={labelClass}>Phương thức</Label>
          <Input placeholder="Tiền mặt / CK" className={inputClass} />
        </TextField>
      </div>

      <TextField value={note} onChange={setNote} className="w-full flex-col gap-1.5">
        <Label className={labelClass}>Ghi chú</Label>
        <TextArea placeholder="Ghi chú (không bắt buộc)" />
      </TextField>

      <div>
        <Button variant="primary" appearance="fill" size="md" isDisabled={pending} onPress={submit}>
          Lưu cọc
        </Button>
      </div>
    </div>
  );
}
