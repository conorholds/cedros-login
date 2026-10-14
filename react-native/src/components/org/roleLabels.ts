import type { OrgRole } from "../../types";

const ORG_ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

/**
 * Return the display label for an organization role.
 *
 * Input: a valid `OrgRole`.
 * Output: user-facing role label for organization selection UI.
 * Errors: none; TypeScript enforces exhaustive role coverage.
 */
export function formatOrgRoleLabel(role: OrgRole): string {
  return ORG_ROLE_LABELS[role];
}
