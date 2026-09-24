"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/crm/google-button";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { signIn } from "@/lib/auth-client";
import { PasswordField } from "../../_components/password-field";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn.email({ email, password });

    setLoading(false);
    if (signInError) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    router.push("/crm/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Đăng nhập</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Chào mừng trở lại! Đăng nhập để tiếp tục.
        </p>
      </div>

      <GoogleButton label="Đăng nhập với Google" />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-card-border" />
        <span className="text-xs font-medium text-text-tertiary">HOẶC</span>
        <span className="h-px flex-1 bg-card-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField value={email} onChange={setEmail} type="email" className="w-full flex-col gap-1.5">
          <Label className="text-sm font-medium text-input-label-text">
            Email <span className="text-error-500">*</span>
          </Label>
          <Input placeholder="user@example.com" className="w-full px-3 py-2.5 text-sm" />
        </TextField>

        <PasswordField
          label="Mật khẩu"
          value={password}
          onChange={setPassword}
          placeholder="Nhập mật khẩu"
        />

        <div className="flex items-center justify-between">
          <Checkbox className="text-sm text-text-secondary">Ghi nhớ đăng nhập</Checkbox>
        </div>

        {error && <p className="text-sm text-error-500">{error}</p>}

        <Button type="submit" variant="primary" appearance="fill" size="lg" isDisabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Chưa có tài khoản?{" "}
        <Link href="/signup" className="font-medium text-neutral-brand-color">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
