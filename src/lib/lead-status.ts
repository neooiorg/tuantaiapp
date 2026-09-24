// Client-safe lead status constants (labels + badge colors).
// Single source of truth for the status enum values — schema.ts imports these.

export const LEAD_STATUS_ORDER = [
  "NEW",
  "CLAIMED",
  "CONSULTING",
  "QUOTED",
  "DEPOSITED",
  "AWAITING_SURVEY",
  "SURVEYED",
  "DESIGNING",
  "AWAITING_APPROVAL",
  "COMPLETED",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_ORDER)[number];

export const LEAD_SOURCES = ["facebook", "manual"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const QUOTE_STATUSES = ["draft", "sent", "accepted"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

// Vietnamese display labels.
export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Lead mới",
  CLAIMED: "Đã nhận",
  CONSULTING: "Đang tư vấn",
  QUOTED: "Đã báo giá",
  DEPOSITED: "Đã cọc",
  AWAITING_SURVEY: "Chờ khảo sát",
  SURVEYED: "Đã khảo sát",
  DESIGNING: "Đang thiết kế",
  AWAITING_APPROVAL: "Chờ duyệt",
  COMPLETED: "Hoàn thành",
};

// Badge colors from the template's Badge component (src/components/tailgrids/core/badge.tsx).
export type BadgeColor =
  | "gray"
  | "primary"
  | "error"
  | "warning"
  | "success"
  | "cyan"
  | "sky"
  | "blue"
  | "violet"
  | "purple"
  | "pink"
  | "rose"
  | "orange";

export const STATUS_BADGE_COLOR: Record<LeadStatus, BadgeColor> = {
  NEW: "gray",
  CLAIMED: "sky",
  CONSULTING: "blue",
  QUOTED: "violet",
  DEPOSITED: "purple",
  AWAITING_SURVEY: "orange",
  SURVEYED: "cyan",
  DESIGNING: "pink",
  AWAITING_APPROVAL: "warning",
  COMPLETED: "success",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: "Facebook",
  manual: "Nhập tay",
};
