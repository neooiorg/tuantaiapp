"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SocialButton } from "@/components/tailgrids/core/social-button";
import { signIn } from "@/lib/auth-client";
import { GoogleIcon } from "@/utils/icon";

export function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const { error } = await signIn.social({ provider: "google", callbackURL: "/crm/dashboard" });
    // On success the browser is redirected to Google; only reach here on error.
    if (error) {
      setLoading(false);
      toast.error("Chưa cấu hình đăng nhập Google (thiếu GOOGLE_CLIENT_ID/SECRET) hoặc có lỗi.");
    }
  }

  return (
    <SocialButton isDisabled={loading} onPress={handleGoogle} className="max-w-none">
      <GoogleIcon className="size-5" />
      {label}
    </SocialButton>
  );
}
