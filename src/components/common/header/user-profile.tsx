"use client";

import { LogoutIcon, UserCircleIcon } from "@/components/common/header/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/tailgrids/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { signOut, useSession } from "@/lib/auth-client";
import { isAppRole, ROLE_LABELS } from "@/lib/permissions";
import { AltArrowDownIcon } from "@/utils/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfileMenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function UserProfileButton() {
  const router = useRouter();
  const { data } = useSession();

  const sessionUser = data?.user;
  const name = sessionUser?.name ?? "Khách";
  const email = sessionUser?.email ?? "";
  const image = sessionUser?.image ?? undefined;
  const roleLabel = isAppRole(sessionUser?.role) ? ROLE_LABELS[sessionUser.role] : null;
  const initial = name.charAt(0).toUpperCase();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const menuItems: UserProfileMenuItem[] = [
    {
      href: "/profile",
      icon: <UserCircleIcon />,
      label: "Trang cá nhân",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2.5 rounded-lg border-0 p-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 focus-visible:ring-offset-1">
        <Avatar>
          {image && (
            <AvatarImage
              src={image}
              alt={name}
              referrerPolicy="no-referrer"
              className="size-10 rounded-lg"
            />
          )}
          <AvatarFallback className="rounded-lg border border-border-secondary-alt bg-background-gray-secondary_alt">
            {initial}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm leading-5 font-medium text-text-primary">{name}</span>

        <AltArrowDownIcon className="text-icon-tertiary transition-transform duration-200 group-aria-expanded:-rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-70 overflow-hidden p-0 shadow-3xl">
        <DropdownMenuHeader className="flex w-full items-center justify-start gap-2 border-b border-border-secondary-alt px-4 py-3">
          <Avatar size="md">
            {image && <AvatarImage src={image} alt={name} referrerPolicy="no-referrer" />}
            <AvatarFallback className="border border-border-secondary-alt bg-background-gray-secondary_alt">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">{name}</span>
            <span className="truncate text-xs text-gray-500">
              {email}
              {roleLabel ? ` · ${roleLabel}` : ""}
            </span>
          </span>
        </DropdownMenuHeader>

        <DropdownMenuSection className="p-1.5">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              href={item.href}
              className="cursor-pointer px-3 py-2.5"
              render={(domProps) =>
                "href" in domProps ? <Link {...domProps} /> : <div {...domProps} />
              }
            >
              <span className="shrink-0 text-icon-secondary group-hover:text-text-primary">
                {item.icon}
              </span>
              <span className="leading-5 font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onAction={handleLogout}
          className="m-1.5 w-auto cursor-pointer px-3 py-2.5"
        >
          <span className="text-icon-secondary group-hover:text-text-primary">
            <LogoutIcon />
          </span>
          <span className="leading-5">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
