import type { Invite } from '../../types';

export function getInviteTargetLabel(
  invite: Pick<Invite, 'email' | 'walletAddress' | 'id'>
): string {
  return invite.email?.trim() || invite.walletAddress?.trim() || invite.id;
}
