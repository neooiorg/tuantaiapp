"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { authClient } from "@/lib/auth-client";
import { updateProfileAction } from "@/server/profile/actions";
import type { Profile } from "@/server/profile/queries";
import Image from "next/image";
import { Form } from "react-aria-components";
import { LogoutIcon, TrashIcon } from "../icons";

const countryOptions = [
  { value: "us", label: "Hoa Kỳ", flag: "/images/flag/US.svg" },
  { value: "ca", label: "Canada", flag: "/images/flag/CA.svg" },
  { value: "fr", label: "Pháp", flag: "/images/flag/FR.svg" },
  { value: "au", label: "Úc", flag: "/images/flag/AU.svg" },
  { value: "it", label: "Ý", flag: "/images/flag/IT.svg" },
  { value: "in", label: "Ấn Độ", flag: "/images/flag/IN.svg" },
];

// Website is stored with the leading protocol stripped (the addon shows "https://").
function stripProtocol(url: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AccountForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);

  const [fullName, setFullName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [website, setWebsite] = useState(stripProtocol(profile.website));
  const [address, setAddress] = useState(profile.address ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [image, setImage] = useState<string | null>(profile.image ?? null);

  function reset() {
    setFullName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setWebsite(stripProtocol(profile.website));
    setAddress(profile.address ?? "");
    setCountry(profile.country ?? "");
    setBio(profile.bio ?? "");
    setImage(profile.image ?? null);
  }

  function save() {
    startTransition(async () => {
      const normalizedWebsite = website.trim() ? `https://${stripProtocol(website)}` : "";
      const res = await updateProfileAction({
        name: fullName,
        phone,
        website: normalizedWebsite,
        address,
        country,
        bio,
        image,
      });
      if (res.ok) {
        toast.success("Đã lưu thông tin tài khoản.");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  async function signOutAll() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Không thể đăng xuất, vui lòng thử lại.");
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Details Card */}
      <Card className="bg-transparent p-5">
        <h2 className="mb-6 text-xl leading-7 font-semibold text-text-primary">Thông tin tài khoản</h2>

        <Form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar size="xxl">
              {image ? <AvatarImage src={image} alt={fullName} /> : null}
              <AvatarFallback>{initials(fullName)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <Button
                  appearance="outline"
                  variant="danger"
                  size="sm"
                  type="button"
                  isDisabled={!image || pending}
                  onPress={() => setImage(null)}
                >
                  Xoá ảnh
                </Button>
              </div>
              <p className="text-xs leading-4 text-text-tertiary">
                Ảnh đại diện được đồng bộ từ tài khoản Google khi đăng nhập.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField value={fullName} onChange={setFullName} className="w-full gap-2.5" required>
              <Label>Họ và tên</Label>
              <Input name="fullName" placeholder="Nguyễn Văn A" className="w-full" />
            </TextField>

            <TextField value={profile.email} type="email" disabled className="w-full gap-2.5">
              <Label>Địa chỉ email</Label>
              <Input name="email" className="w-full" />
            </TextField>

            <TextField value={phone} onChange={setPhone} className="w-full gap-2.5">
              <Label>Số điện thoại</Label>
              <Input name="phone" placeholder="+84 90 123 4567" className="w-full" />
            </TextField>

            <TextField value={website} onChange={setWebsite} className="w-full gap-2.5">
              <Label>Website</Label>
              <InputGroup>
                <InputGroupAddon className="after h-full border-r border-card-border text-input-placeholder-text-color">
                  https://
                </InputGroupAddon>
                <InputGroupInput name="website" placeholder="www.example.com" className="pl-2" />
              </InputGroup>
            </TextField>

            <TextField value={address} onChange={setAddress} className="w-full gap-2.5">
              <Label>Địa chỉ</Label>
              <Input name="address" placeholder="Số nhà, đường, phường, quận" className="w-full" />
            </TextField>

            <div>
              <Select
                name="country"
                value={country || undefined}
                onChange={(key) => setCountry((key as string) ?? "")}
                placeholder="Chọn quốc gia"
                className="h-full"
              >
                <SelectLabel>Quốc gia</SelectLabel>
                <SelectTrigger className="h-full w-full border-input-border">
                  <SelectValue className="flex items-center gap-2" />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((option) => (
                    <SelectItem key={option.value} id={option.value} textValue={option.label}>
                      <span className="flex items-center gap-2">
                        <Image
                          src={option.flag}
                          alt={option.label}
                          width={20}
                          height={20}
                          className="size-5 rounded-full object-cover"
                        />
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TextField
              value={bio}
              onChange={setBio}
              className="col-span-1 w-full gap-2.5 md:col-span-2"
            >
              <Label>Giới thiệu</Label>
              <TextArea name="bio" className="h-25 shadow-xs" placeholder="Giới thiệu ngắn về bạn." />
            </TextField>

            <div className="col-span-1 flex items-center justify-end gap-3 md:col-span-2">
              <Button
                appearance="outline"
                variant="primary"
                size="lg"
                type="button"
                className="px-3.5 text-sm"
                isDisabled={pending}
                onPress={reset}
              >
                Huỷ
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="px-3.5 text-sm"
                isDisabled={pending}
              >
                {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </Form>
      </Card>

      <Card className="bg-transparent p-5">
        {/* Sign Out */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm leading-5 font-medium text-text-primary">
              Đăng xuất khỏi tất cả thiết bị
            </p>
            <p className="text-xs leading-4 text-text-tertiary">
              Kết thúc mọi phiên đăng nhập trên các thiết bị của bạn.
            </p>
          </div>

          <Button
            appearance="outline"
            variant="primary"
            size="lg"
            type="button"
            className="gap-2 px-3.5 py-2 text-sm [&>svg]:size-5"
            isDisabled={signingOut}
            onPress={signOutAll}
          >
            <LogoutIcon />
            {signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </div>
        <hr className="my-4 border-border-secondary-alt" />
        {/* Delete Account */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm leading-5 font-medium text-text-primary">Xoá tài khoản</p>
            <p className="text-xs leading-4 text-text-tertiary">
              Xoá vĩnh viễn tài khoản của bạn cùng toàn bộ dữ liệu liên quan.
            </p>
          </div>

          <Button
            appearance="outline"
            variant="danger"
            size="lg"
            type="button"
            className="gap-2 px-3.5 text-sm [&>svg]:size-5"
            onPress={() => toast.info("Vui lòng liên hệ quản trị viên để xoá tài khoản.")}
          >
            <TrashIcon />
            Xoá tài khoản
          </Button>
        </div>
      </Card>
    </div>
  );
}
