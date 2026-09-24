import Providers from "@/app/providers";
import { cn } from "@/utils/cn";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Anybody } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const anybody = Anybody({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | TuanTaiCRM",
    default: "TuanTaiCRM - CRM Quy trình Nội thất",
  },
  description: "CRM quản lý quy trình nội thất: lead, báo giá, khảo sát, thiết kế.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn("h-full overflow-hidden antialiased", anybody.className)}
    >
      <body className="h-full overflow-hidden bg-background-gray-secondary_alt_2">
        <ThemeProvider defaultTheme="light" enableSystem>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
