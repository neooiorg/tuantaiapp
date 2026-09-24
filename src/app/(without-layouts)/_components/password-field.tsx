"use client";

import { Eye } from "@tailgrids/icons";
import { useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <TextField value={value} onChange={onChange} className="w-full flex-col gap-1.5">
      <Label className="text-sm font-medium text-input-label-text">
        {label} <span className="text-error-500">*</span>
      </Label>
      <InputGroup>
        <InputGroupInput
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm"
        />
        <InputGroupButton
          size="icon-sm"
          className="mr-1 text-text-secondary hover:text-text-primary"
          onPress={() => setShow((s) => !s)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <Eye className="size-5" />
        </InputGroupButton>
      </InputGroup>
    </TextField>
  );
}
