import { BellIcon, ShieldCheckIcon, UserIcon } from "./icons";

export const tabsItems = [
  {
    href: "/profile/account",
    icon: <UserIcon />,
    title: "Tài khoản",
    description: "Quản lý thông tin cá nhân của bạn",
  },
  {
    href: "/profile/security",
    icon: <ShieldCheckIcon />,
    title: "Bảo mật",
    description: "Thiết lập mật khẩu, xác thực & khác",
  },
  {
    href: "/profile/notification",
    icon: <BellIcon />,
    title: "Thông báo",
    description: "Tuỳ chỉnh các thiết lập thông báo",
  },
];
