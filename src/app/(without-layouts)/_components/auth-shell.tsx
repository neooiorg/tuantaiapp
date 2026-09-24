import Link from "next/link";
import { AltArrowLeftIcon } from "@/utils/icon";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-background-gray-secondary_alt_2 p-4">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl border border-card-border bg-card-surface-area shadow-sm">
        {/* Left: form */}
        <div className="relative w-full p-6 sm:p-10 lg:w-1/2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg border border-card-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <AltArrowLeftIcon className="size-4" />
            Quay lại
          </Link>

          <div className="mx-auto mt-8 max-w-md">{children}</div>
        </div>

        {/* Right: brand panel */}
        <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 p-12 text-white-100 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 14px)",
            }}
          />
          <div className="relative">
            <p className="mb-3 text-2xl font-semibold">TuanTaiCRM</p>
            <p className="mb-2 text-sm font-medium text-white-100/80">CRM Quy trình Nội thất</p>
            <h2 className="text-3xl leading-tight font-semibold">
              Ứng dụng quản lý nội bộ
              <br />
              dành riêng cho Nội thất Tuấn Tài
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
