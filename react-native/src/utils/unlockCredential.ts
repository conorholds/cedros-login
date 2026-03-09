import type { UnlockCredential, UnlockCredentialRequest } from '../types/wallet';

/**
 * Convert UnlockCredential to API request format.
 */
export function toCredentialRequest(credential: UnlockCredential): UnlockCredentialRequest {
  switch (credential.type) {
    case 'password':
      return { password: credential.password };
    case 'prfOutput':
      return { prfOutput: credential.prfOutput };
  }
}
