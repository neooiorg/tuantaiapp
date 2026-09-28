"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { type LeadStatus } from "@/lib/lead-status";
import { getAvailableTransitions, type AppRole } from "@/lib/permissions";
import { transitionLeadAction } from "@/server/lead/actions";

// Data preconditions the UI mirrors from the server state machine, so a button
// is disabled (with a hint) instead of erroring only after being clicked.
function precondition(
  to: LeadStatus,
  ctx: { hasQuote: boolean; hasDeposit: boolean },
): string | null {
  if (to === "QUOTED" && !ctx.hasQuote) return "Cần có ít nhất 1 báo giá trước khi chốt.";
  if (to === "DEPOSITED" && !ctx.hasDeposit) return "Cần ghi nhận cọc trước khi xác nhận.";
  return null;
}

export function TransitionActions({
  leadId,
  status,
  role,
  hasQuote,
  hasDeposit,
}: {
  leadId: string;
  status: LeadStatus;
  role: AppRole;
  hasQuote: boolean;
  hasDeposit: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const transitions = getAvailableTransitions(role, status);
  const needsNote = transitions.some((t) => t.requiresNote);

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Không có hành động khả dụng cho vai trò của bạn ở bước này.
      </p>
    );
  }

  function run(to: LeadStatus) {
    startTransition(async () => {
      const res = await transitionLeadAction(leadId, to, note || undefined);
      if (res.ok) {
        toast.success("Đã cập nhật trạng thái.");
        setNote("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {needsNote && (
        <TextField value={note} onChange={setNote} className="w-full gap-1.5">
          <Label className="text-sm font-medium text-input-label-text">
            Ghi chú (bắt buộc khi yêu cầu chỉnh sửa)
          </Label>
          <TextArea placeholder="Nhập nội dung khách yêu cầu chỉnh sửa..." />
        </TextField>
      )}
      <div className="flex flex-wrap gap-3">
        {transitions.map((t) => {
          const blocked = precondition(t.to, { hasQuote, hasDeposit });
          return (
            <div key={`${t.from}-${t.to}`} className="flex flex-col gap-1">
              <Button
                variant={t.requiresNote ? "danger" : "primary"}
                appearance="fill"
                size="md"
                isDisabled={pending || !!blocked}
                onPress={() => run(t.to)}
              >
                {t.actionLabel}
              </Button>
              {blocked && <span className="text-xs text-text-tertiary">{blocked}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
