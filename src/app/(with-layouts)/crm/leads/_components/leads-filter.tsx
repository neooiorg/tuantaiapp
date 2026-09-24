"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
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

export function LeadsFilter({ status, q }: { status?: string; q?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q ?? "");

  function apply(next: { status?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.status !== undefined) {
      if (next.status && next.status !== ALL) params.set("status", next.status);
      else params.delete("status");
    }
    if (next.q !== undefined) {
      if (next.q.trim()) params.set("q", next.q.trim());
      else params.delete("q");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status ?? ALL}
        onChange={(val) => apply({ status: String(val) })}
        className="w-56"
        aria-label="Lọc theo trạng thái"
      >
        <SelectTrigger className="w-full border-border-secondary bg-input-background py-2.5">
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

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: search });
        }}
      >
        <TextField value={search} onChange={setSearch} aria-label="Tìm kiếm" className="w-64">
          <Input placeholder="Tìm theo tên hoặc SĐT" className="w-full px-3 py-2.5 text-sm" />
        </TextField>
        <Button type="submit" variant="primary" appearance="outline" size="md">
          Tìm
        </Button>
      </form>
    </div>
  );
}
