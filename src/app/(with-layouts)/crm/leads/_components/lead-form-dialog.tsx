"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { createLeadAction } from "@/server/lead/actions";

const labelClass = "text-sm font-medium text-input-label-text";
const inputClass = "w-full px-3 py-2.5 text-sm";

export function LeadFormDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await createLeadAction({ name, phone, email, note });
      if (res.ok) {
        toast.success("Đã tạo lead.");
        onOpenChange(false);
        router.push(`/crm/leads/${res.id}`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Tạo lead</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        <TextField value={name} onChange={setName} className="w-full flex-col gap-1.5">
          <Label className={labelClass}>Tên khách</Label>
          <Input placeholder="Nguyễn Văn A" className={inputClass} />
        </TextField>

        <TextField value={phone} onChange={setPhone} className="w-full flex-col gap-1.5">
          <Label className={labelClass}>Số điện thoại</Label>
          <Input placeholder="+84 90 123 4567" className={inputClass} />
        </TextField>

        <TextField value={email} onChange={setEmail} type="email" className="w-full flex-col gap-1.5">
          <Label className={labelClass}>Email (không bắt buộc)</Label>
          <Input placeholder="email@khachhang.com" className={inputClass} />
        </TextField>

        <TextField value={note} onChange={setNote} className="w-full flex-col gap-1.5">
          <Label className={labelClass}>Ghi chú (không bắt buộc)</Label>
          <TextArea placeholder="Nhu cầu, nguồn giới thiệu…" className="h-20 w-full px-3 py-2.5 text-sm" />
        </TextField>
      </div>

      <DialogFooter>
        <Button variant="ghost" size="md" isDisabled={pending} onPress={() => onOpenChange(false)}>
          Huỷ
        </Button>
        <Button variant="primary" appearance="fill" size="md" isDisabled={pending} onPress={submit}>
          {pending ? "Đang tạo..." : "Tạo lead"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
