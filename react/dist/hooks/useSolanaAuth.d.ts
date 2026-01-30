import { AuthResponse, AuthError, ChallengeResponse } from '../types';
export interface UseSolanaAuthReturn {
    requestChallenge: (publicKey: string) => Promise<ChallengeResponse>;
    signIn: (publicKey: string, signature: string, message: string) => Promise<AuthResponse>;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
}
/**
 * Hook for Solana wallet authentication.
 *
 * @example
 * ```tsx
 * function SolanaLogin() {
 *   const { requestChallenge, signIn, isLoading } = useSolanaAuth();
 *   const { publicKey, signMessage } = useWallet();
 *
 *   const handleLogin = async () => {
 *     const challenge = await requestChallenge(publicKey.toBase58());
 *     const signature = await signMessage(new TextEncoder().encode(challenge.message));
 *     const result = await signIn(
 *       publicKey.toBase58(),
 *       Buffer.from(signature).toString('base64'),
 *       challenge.message
 *     );
 *   };
 * }
 * ```
 */
export declare function useSolanaAuth(): UseSolanaAuthReturn;
