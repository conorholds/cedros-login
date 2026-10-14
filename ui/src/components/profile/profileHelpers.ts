/**
 * Pure helper utilities for the profile settings UI.
 */

interface UserLike {
  name?: string | null;
  email?: string | null;
  walletAddress?: string | null;
}

/**
 * Returns up to two initials for avatar fallback display.
 *
 * @param user - Object with optional name, email, and wallet fields.
 * @returns 1–2 uppercase characters, or '?' when no identity field is set.
 */
export function getInitials(user: UserLike | null | undefined): string {
  if (user?.name) {
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (user?.email) {
    return user.email[0].toUpperCase();
  }
  if (user?.walletAddress) {
    return user.walletAddress.slice(0, 2).toUpperCase();
  }
  return '?';
}

/**
 * Shortens a wallet address for display, e.g. `7xKX…9fA2`.
 */
export function shortenWalletAddress(address: string): string {
  const trimmed = address.trim();
  if (trimmed.length <= 11) return trimmed;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

/**
 * Best human-friendly label for a user who may sign in with email, OAuth, or a
 * wallet. Falls back name → email → shortened wallet → "User" so the profile
 * never renders an empty identity for wallet-only accounts.
 */
export function getDisplayName(user: UserLike | null | undefined): string {
  if (user?.name?.trim()) return user.name.trim();
  if (user?.email?.trim()) return user.email.trim();
  if (user?.walletAddress?.trim()) return shortenWalletAddress(user.walletAddress);
  return 'User';
}
