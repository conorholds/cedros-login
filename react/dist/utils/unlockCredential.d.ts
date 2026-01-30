import { UnlockCredential, UnlockCredentialRequest } from '../types/wallet';
/**
 * Convert UnlockCredential to API request format.
 */
export declare function toCredentialRequest(credential: UnlockCredential): UnlockCredentialRequest;
