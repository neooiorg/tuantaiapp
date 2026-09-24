"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { claimLeadAction } from "@/server/lead/actions";

export function ClaimButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClaim() {
    startTransition(async () => {
      const res = await claimLeadAction(leadId);
      if (res.ok) {
        toast.success("Đã nhận khách.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Button variant="primary" appearance="fill" size="sm" isDisabled={pending} onPress={handleClaim}>
      Nhận khách
    </Button>
  );
}
