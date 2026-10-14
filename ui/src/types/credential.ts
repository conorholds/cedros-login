/**
 * Credential (linked sign-in method) types
 *
 * Represents the various authentication credentials a user has linked
 * to their account (password, OAuth, wallet, passkey, etc.).
 */

import type { AuthError } from './auth';

/** Supported credential types matching server enum */
export type CredentialType =
  | 'password'
  | 'oauth_google'
  | 'oauth_apple'
  | 'solana'
  | 'webauthn_passkey'
  | 'webauthn_security_key'
  | 'totp'
  | 'sso_oidc';

/** A single linked credential / sign-in method */
export interface Credential {
  id: string;
  credentialType: CredentialType;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  isPrimary: boolean;
}

/** Response from GET /credentials */
export interface ListCredentialsResponse {
  credentials: Credential[];
}

/** Return type for useCredentials hook */
export interface UseCredentialsReturn {
  /** List of linked credentials */
  credentials: Credential[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AuthError | null;
  /** Fetch/refresh credentials list */
  fetchCredentials: () => Promise<void>;
  /** Unlink a credential by ID */
  unlinkCredential: (id: string) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}
