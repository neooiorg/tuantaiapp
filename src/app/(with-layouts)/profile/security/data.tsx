import { ClockCircleIcon, DisplayIcon, LockIcon, ShieldCheckIcon } from "./icons";

export const securityItems = [
  {
    icon: LockIcon,
    title: "Mật khẩu hiện tại",
    description: "Đổi mật khẩu tài khoản để giữ hồ sơ của bạn an toàn",
    actionLabel: "Đổi",
  },
  {
    icon: ShieldCheckIcon,
    title: "Xác thực hai lớp",
    description: "Bật xác thực hai bước để tăng cường bảo vệ tài khoản",
    actionLabel: "Bật",
  },
  {
    icon: DisplayIcon,
    title: "Phiên đang hoạt động",
    description: "Xem và quản lý các phiên đăng nhập đang hoạt động",
    actionLabel: "3 phiên",
  },
  {
    icon: ClockCircleIcon,
    title: "Lịch sử đăng nhập",
    description: "Xem lại hoạt động đăng nhập và lịch sử truy cập gần đây",
    actionLabel: "Xem lịch sử",
  },
] as const;
