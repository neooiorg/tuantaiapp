"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { formatDateTime } from "@/lib/format";
import type { BadgeColor } from "@/lib/lead-status";
import { isAppRole, ROLE_LABELS, type AppRole } from "@/lib/permissions";
import { deleteMemberAction } from "@/server/members/actions";
import type { Member } from "@/server/members/queries";
import { MemberFormDialog } from "./member-form-dialog";

const ROLE_COLOR: Record<AppRole, BadgeColor> = {
  admin: "purple",
  sales: "primary",
  technician: "sky",
  designer: "pink",
};

const headCellClass =
  "px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary whitespace-nowrap";
const bodyCellClass =
  "h-16 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] text-text-primary";

function RoleBadge({ role }: { role: string | null }) {
  if (isAppRole(role)) {
    return (
      <Badge color={ROLE_COLOR[role]} size="md">
        {ROLE_LABELS[role]}
      </Badge>
    );
  }
  return (
    <Badge color="gray" size="md">
      Chưa gán
    </Badge>
  );
}

export function MembersTable({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const res = await deleteMemberAction(id);
      if (res.ok) {
        toast.success("Đã xoá thành viên.");
        setDeleting(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <TableRoot className="w-full rounded-none border-none">
            <TableHeader>
              <TableRow className="bg-background-gray-secondary_alt">
                <TableHead className={headCellClass}>Họ tên</TableHead>
                <TableHead className={headCellClass}>Email</TableHead>
                <TableHead className={headCellClass}>Vai trò</TableHead>
                <TableHead className={headCellClass}>Ngày tạo</TableHead>
                <TableHead className={headCellClass}>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="px-6 py-10 text-center text-sm text-text-secondary"
                    colSpan={5}
                  >
                    Chưa có thành viên.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id} className="[&_td]:border-none">
                    <TableCell className={bodyCellClass}>{m.name}</TableCell>
                    <TableCell className={`${bodyCellClass} whitespace-nowrap`}>{m.email}</TableCell>
                    <TableCell className={bodyCellClass}>
                      <RoleBadge role={m.role} />
                    </TableCell>
                    <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                      {formatDateTime(m.createdAt)}
                    </TableCell>
                    <TableCell className={bodyCellClass}>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          appearance="outline"
                          size="sm"
                          onPress={() => setEditing(m)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          appearance="outline"
                          size="sm"
                          isDisabled={m.id === currentUserId}
                          onPress={() => setDeleting(m)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableRoot>
        </CardContent>
      </Card>

      {editing && (
        <MemberFormDialog
          isOpen={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          mode="edit"
          initial={{
            id: editing.id,
            name: editing.name,
            email: editing.email,
            role: isAppRole(editing.role) ? editing.role : "sales",
          }}
        />
      )}

      <Dialog isOpen={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogHeader>
          <DialogTitle>Xoá thành viên</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-text-secondary">
          Xoá <b className="text-text-primary">{deleting?.name}</b> ({deleting?.email})? Hành động
          này không thể hoàn tác.
        </div>
        <DialogFooter>
          <Button variant="ghost" size="md" isDisabled={pending} onPress={() => setDeleting(null)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            appearance="fill"
            size="md"
            isDisabled={pending}
            onPress={confirmDelete}
          >
            Xoá
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
