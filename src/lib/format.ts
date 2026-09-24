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
