"use client";

import { Button, buttonStyles } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { TextField } from "@/components/tailgrids/core/text-field";
import { cn } from "@/utils/cn";
import { Eye, EyeDisabled } from "@tailgrids/icons";
import { useState } from "react";
import { FieldError, Form } from "react-aria-components";
import { securityItems } from "./data";

export default function SecurityTabContent() {
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div>
      <h2 className="text-xl leading-7 font-semibold text-text-primary">Bảo mật</h2>

      <div className="mt-6 space-y-2 divide-y divide-card-border">
        {securityItems.map(({ icon: Icon, title, description, actionLabel }) => (
          <div
            key={title}
            className="flex flex-col gap-4 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-gray-secondary_alt text-icon-secondary">
                <Icon />
              </div>

              <div className="min-w-0">
                <p className="text-sm leading-5 font-medium text-text-primary">{title}</p>
                <p className="mt-1 text-xs leading-4 text-text-tertiary">{description}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto shrink-0 rounded-none py-2 pr-0 text-base text-brand-500 hover:bg-transparent hover:text-brand-600 focus:ring-0"
              onClick={() => actionLabel === "Đổi" && setOpenPasswordDialog(true)}
            >
              {actionLabel}
            </Button>
          </div>
        ))}
      </div>

      <OverlayWrapper isOpen={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
        <Backdrop isDismissable>
          <Dialog className="max-w-108.75 p-0">
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                setOpenPasswordDialog(false);
              }}
            >
              <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                <DialogTitle className="text-xl leading-7">Cập nhật mật khẩu</DialogTitle>
                <DialogDescription className="text-text-tertiary">
                  Tạo mật khẩu an toàn để bảo vệ tài khoản của bạn
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-4 px-5 py-4">
                <TextField className="gap-1.5">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      autoComplete="current-password"
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showCurrentPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Chọn mật khẩu mới"
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNewPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldError />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirmPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldError />
                </TextField>
              </DialogBody>

              <DialogFooter className="border-t border-card-border px-5 py-4">
                <DialogClose
                  className={cn(
                    buttonStyles({
                      appearance: "outline",
                      size: "lg",
                      className: "px-3.5 text-sm",
                    }),
                  )}
                >
                  Huỷ
                </DialogClose>
                <Button type="submit" size="lg" className="px-3.5 text-sm">
                  Áp dụng
                </Button>
              </DialogFooter>
            </Form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>
    </div>
  );
}
