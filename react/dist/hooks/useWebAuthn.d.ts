import { AuthError, AuthResponse } from '../types';
export interface UseWebAuthnReturn {
    isSupported: boolean;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
    /** Start a server-managed WebAuthn authentication ceremony (login). */
    authenticatePasskey: (params?: {
        email?: string;
    }) => Promise<AuthResponse>;
    /** Register a new passkey for the currently authenticated user. */
    registerPasskey: (params?: {
        label?: string;
    }) => Promise<{
        credentialId: string;
        label?: string;
    }>;
}
/**
 * Server-managed WebAuthn (passkey) authentication + registration.
 *
 * - Login: /webauthn/auth/options -> navigator.credentials.get -> /webauthn/auth/verify
 * - Registration: /webauthn/register/options -> navigator.credentials.create -> /webauthn/register/verify
 */
export declare function useWebAuthn(): UseWebAuthnReturn;
