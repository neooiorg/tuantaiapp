"use client";

import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { MemberFormDialog } from "./member-form-dialog";

export function AddMemberButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" appearance="fill" size="md" onPress={() => setOpen(true)}>
        + Thêm thành viên
      </Button>
      {open && <MemberFormDialog isOpen onOpenChange={setOpen} mode="add" />}
    </>
  );
}
