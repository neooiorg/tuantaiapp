export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatVnd(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

// Short Vietnamese relative time, e.g. "5 phút trước", "2 giờ trước".
export function timeAgo(value: Date | string): string {
  const then = new Date(value).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return formatDate(value);
}
