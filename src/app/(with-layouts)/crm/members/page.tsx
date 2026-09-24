import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { getCurrentUser } from "@/server/auth/session";
import { listMembers } from "@/server/members/queries";
import { AddMemberButton } from "./_components/add-member-button";
import { MembersTable } from "./_components/members-table";

export const metadata: Metadata = {
  title: "Thành viên",
};

export default async function MembersPage() {
  const user = await getCurrentUser();

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="max-w-100 text-center text-sm text-text-secondary">
          Chỉ quản trị viên mới được quản lý thành viên.
        </p>
      </div>
    );
  }

  const members = await listMembers();

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Thành viên</h1>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/dashboard", label: "CRM" },
            { href: "/crm/members", label: "Thành viên" },
          ]}
        />
      </div>

      <div className="space-y-4 px-2 lg:px-5">
        <div className="flex justify-end">
          <AddMemberButton />
        </div>
        <MembersTable members={members} currentUserId={user.id} />
      </div>
    </div>
  );
}
