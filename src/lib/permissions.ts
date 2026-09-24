// Client-safe RBAC + lead state machine.
// Shared by the UI (to render only valid actions) and the server (transitionLead).

import { LEAD_STATUS_ORDER, type LeadStatus } from "./lead-status";

export const APP_ROLES = ["admin", "sales", "technician", "designer"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Quản trị",
  sales: "Kinh doanh",
  technician: "Kỹ thuật",
  designer: "Thiết kế",
};

// Roles that can currently be assigned to a member. technician/designer are part of the
// workflow but not offered in the UI yet (added when the survey/design phases go live).
export const ASSIGNABLE_ROLES = ["admin", "sales"] as const satisfies readonly AppRole[];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

// One transition definition: from -> to, plus which non-admin roles may perform it.
// admin is always allowed. `note: true` means a note is required (used for revisions).
export interface TransitionDef {
  from: LeadStatus;
  to: LeadStatus;
  roles: AppRole[];
  requiresNote?: boolean;
  // Vietnamese label for the action button.
  actionLabel: string;
}

export const TRANSITIONS: TransitionDef[] = [
  { from: "NEW", to: "CLAIMED", roles: ["sales"], actionLabel: "Nhận khách" },
  { from: "CLAIMED", to: "CONSULTING", roles: ["sales"], actionLabel: "Bắt đầu tư vấn" },
  { from: "CONSULTING", to: "QUOTED", roles: ["sales"], actionLabel: "Chốt báo giá" },
  { from: "QUOTED", to: "DEPOSITED", roles: ["sales"], actionLabel: "Xác nhận đã cọc" },
  { from: "DEPOSITED", to: "AWAITING_SURVEY", roles: ["sales"], actionLabel: "Tạo lịch khảo sát" },
  { from: "AWAITING_SURVEY", to: "SURVEYED", roles: ["technician"], actionLabel: "Hoàn tất khảo sát" },
  { from: "SURVEYED", to: "DESIGNING", roles: ["sales"], actionLabel: "Chuyển thiết kế" },
  { from: "DESIGNING", to: "AWAITING_APPROVAL", roles: ["designer"], actionLabel: "Gửi khách duyệt" },
  { from: "AWAITING_APPROVAL", to: "COMPLETED", roles: ["designer"], actionLabel: "Khách duyệt - Hoàn thành" },
  {
    from: "AWAITING_APPROVAL",
    to: "DESIGNING",
    roles: ["designer"],
    requiresNote: true,
    actionLabel: "Khách yêu cầu chỉnh sửa",
  },
];

export function findTransition(from: LeadStatus, to: LeadStatus): TransitionDef | undefined {
  return TRANSITIONS.find((t) => t.from === from && t.to === to);
}

export function canRoleTransition(role: AppRole, def: TransitionDef): boolean {
  return role === "admin" || def.roles.includes(role);
}

// Transitions a role may trigger from a given status (for rendering action buttons).
export function getAvailableTransitions(role: AppRole, from: LeadStatus): TransitionDef[] {
  return TRANSITIONS.filter((t) => t.from === from && canRoleTransition(role, t));
}

// Ensure the matrix stays exhaustive over the enum at type-check time.
export const _statusCount: Record<LeadStatus, true> = Object.fromEntries(
  LEAD_STATUS_ORDER.map((s) => [s, true]),
) as Record<LeadStatus, true>;
