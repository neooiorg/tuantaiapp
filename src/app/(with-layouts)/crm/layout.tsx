import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!user.role) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="max-w-100 text-center text-sm text-text-secondary">
          Tài khoản của bạn chưa được phân quyền. Vui lòng liên hệ quản trị viên.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
