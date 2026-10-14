import type { InviteApiResponse } from "../../types";

export function getInviteTargetLabel(
  invite: Pick<InviteApiResponse, "email" | "walletAddress" | "id">,
): string {
  return invite.email?.trim() || invite.walletAddress?.trim() || invite.id;
}
