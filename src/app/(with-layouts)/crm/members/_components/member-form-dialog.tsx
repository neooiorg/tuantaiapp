"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextField } from "@/components/tailgrids/core/text-field";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type AppRole } from "@/lib/permissions";
import { createMemberAction, updateMemberAction } from "@/server/members/actions";

export type MemberInitial = { id: string; name: string; email: string; role: AppRole };

const labelClass = "text-sm font-medium text-input-label-text";
const inputClass = "w-full px-3 py-2.5 text-sm";

export function MemberFormDialog({
  isOpen,
  onOpenChange,
  mode,
  initial,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initial?: MemberInitial;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<AppRole>(initial?.role ?? "sales");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res =
        mode === "add"
          ? await createMemberAction({ name, email, role })
          : await updateMemberAction(initial!.id, { name, role });
      if (res.ok) {
        toast.success(mode === "add" ? "Đã thêm thành viên." : "Đã cập nhật thành viên.");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{mode === "add" ? "Thêm thành viên" : "Sửa thành viên"}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        <TextField value={name} onChange={setName} className="w-full flex-col gap-1.5">
          <Label className={labelClass}>Họ tên</Label>
          <Input placeholder="Nguyễn Văn A" className={inputClass} />
        </TextField>

        <TextField
          value={email}
          onChange={setEmail}
          type="email"
          disabled={mode === "edit"}
          className="w-full flex-col gap-1.5"
        >
          <Label className={labelClass}>Email</Label>
          <Input placeholder="email@congty.com" className={inputClass} />
        </TextField>

        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>Vai trò</Label>
          <Select
            value={role}
            onChange={(v) => setRole(v as AppRole)}
            aria-label="Vai trò"
            className="w-full"
          >
            <SelectTrigger className="w-full border-border-secondary bg-input-background py-2.5">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent className="min-w-(--trigger-width)">
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r} id={r} textValue={ROLE_LABELS[r]}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" size="md" isDisabled={pending} onPress={() => onOpenChange(false)}>
          Huỷ
        </Button>
        <Button variant="primary" appearance="fill" size="md" isDisabled={pending} onPress={submit}>
          {mode === "add" ? "Thêm" : "Lưu"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
