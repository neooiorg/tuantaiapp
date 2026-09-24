"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleButton } from "@/components/crm/google-button";
import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { signUp } from "@/lib/auth-client";
import { PasswordField } from "../../_components/password-field";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!agree) {
      setError("Vui lòng đồng ý với điều khoản.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp.email({ name, email, password });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? "Không thể tạo tài khoản.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Đăng ký thành công</h1>
        <p className="text-sm text-text-primary">
          Vui lòng liên hệ quản trị viên để được phân quyền trước khi sử dụng.
        </p>
        <Link href="/login" className="font-medium text-neutral-brand-color">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Đăng ký</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Điền đầy đủ thông tin bên dưới để tạo tài khoản.
        </p>
      </div>

      <GoogleButton label="Đăng ký với Google" />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-card-border" />
        <span className="text-xs font-medium text-text-tertiary">HOẶC</span>
        <span className="h-px flex-1 bg-card-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField value={name} onChange={setName} className="w-full flex-col gap-1.5">
          <Label className="text-sm font-medium text-input-label-text">
            Họ tên <span className="text-error-500">*</span>
          </Label>
          <Input placeholder="Nguyễn Văn A" className="w-full px-3 py-2.5 text-sm" />
        </TextField>

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
          placeholder="Tối thiểu 8 ký tự"
        />
        <PasswordField
          label="Nhập lại mật khẩu"
          value={confirm}
          onChange={setConfirm}
          placeholder="Nhập lại mật khẩu"
        />

        <Checkbox
          isSelected={agree}
          onChange={setAgree}
          className="text-sm text-text-secondary"
        >
          Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
        </Checkbox>

        {error && <p className="text-sm text-error-500">{error}</p>}

        <Button type="submit" variant="primary" appearance="fill" size="lg" isDisabled={loading}>
          {loading ? "Đang tạo..." : "Đăng ký"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-neutral-brand-color">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
