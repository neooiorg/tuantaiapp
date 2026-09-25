import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ",
};

export default function AccountPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
