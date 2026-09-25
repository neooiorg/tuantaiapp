"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
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
import { LEAD_STATUS_ORDER, STATUS_LABELS } from "@/lib/lead-status";

const ALL = "ALL";
const UNASSIGNED = "unassigned";

type SalesUser = { id: string; name: string };

export function LeadsFilter({
  status,
  q,
  salesId,
  from,
  to,
  salesUsers,
}: {
  status?: string;
  q?: string;
  salesId?: string;
  from?: string;
  to?: string;
  salesUsers: SalesUser[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q ?? "");

  const hasFilters = Boolean(status || q || salesId || from || to);

  function apply(next: Partial<Record<"status" | "q" | "salesId" | "from" | "to", string>>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value && value !== ALL) params.set(key, value.trim());
      else params.delete(key);
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll() {
    setSearch("");
    router.push(pathname);
  }

  const labelClass = "text-xs font-medium text-text-tertiary";
  const controlClass = "border-border-secondary bg-input-background py-2.5";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass}>Trạng thái</Label>
        <Select
          value={status ?? ALL}
          onChange={(val) => apply({ status: String(val) })}
          className="w-48"
          aria-label="Lọc theo trạng thái"
        >
          <SelectTrigger className={`w-full ${controlClass}`}>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            <SelectItem id={ALL} textValue="Tất cả trạng thái">
              Tất cả trạng thái
            </SelectItem>
            {LEAD_STATUS_ORDER.map((s) => (
              <SelectItem key={s} id={s} textValue={STATUS_LABELS[s]}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assigned salesperson */}
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass}>Sales phụ trách</Label>
        <Select
          value={salesId ?? ALL}
          onChange={(val) => apply({ salesId: String(val) })}
          className="w-48"
          aria-label="Lọc theo nhân viên"
        >
          <SelectTrigger className={`w-full ${controlClass}`}>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            <SelectItem id={ALL} textValue="Tất cả nhân viên">
              Tất cả nhân viên
            </SelectItem>
            <SelectItem id={UNASSIGNED} textValue="Chưa gán">
              Chưa gán
            </SelectItem>
            {salesUsers.map((u) => (
              <SelectItem key={u.id} id={u.id} textValue={u.name}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Created-at range */}
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass}>Từ ngày</Label>
        <Input
          type="date"
          aria-label="Từ ngày"
          value={from ?? ""}
          max={to || undefined}
          onChange={(e) => apply({ from: e.target.value })}
          className="w-40 py-2.5"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className={labelClass}>Đến ngày</Label>
        <Input
          type="date"
          aria-label="Đến ngày"
          value={to ?? ""}
          min={from || undefined}
          onChange={(e) => apply({ to: e.target.value })}
          className="w-40 py-2.5"
        />
      </div>

      {/* Search */}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: search });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>Tìm kiếm</Label>
          <TextField value={search} onChange={setSearch} aria-label="Tìm kiếm" className="w-56">
            <Input placeholder="Tìm theo tên hoặc SĐT" className="w-full px-3 py-2.5 text-sm" />
          </TextField>
        </div>
        <Button type="submit" variant="primary" appearance="outline" size="md">
          Tìm
        </Button>
      </form>

      {hasFilters && (
        <Button type="button" variant="ghost" size="md" onPress={clearAll}>
          Xóa lọc
        </Button>
      )}
    </div>
  );
}
