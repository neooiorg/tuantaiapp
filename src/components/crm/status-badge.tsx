import { Badge } from "@/components/tailgrids/core/badge";
import {
  SOURCE_LABELS,
  STATUS_BADGE_COLOR,
  STATUS_LABELS,
  type LeadSource,
  type LeadStatus,
} from "@/lib/lead-status";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge color={STATUS_BADGE_COLOR[status]} size="md">
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  return (
    <Badge color={source === "facebook" ? "blue" : "gray"} size="md">
      {SOURCE_LABELS[source]}
    </Badge>
  );
}
