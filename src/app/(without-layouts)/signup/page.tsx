import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import SignupForm from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Đăng ký",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
