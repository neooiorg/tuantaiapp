"use client";

import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { LeadFormDialog } from "./lead-form-dialog";

export function AddLeadButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" appearance="fill" size="md" onPress={() => setOpen(true)}>
        + Tạo lead
      </Button>
      {open && <LeadFormDialog isOpen onOpenChange={setOpen} />}
    </>
  );
}
