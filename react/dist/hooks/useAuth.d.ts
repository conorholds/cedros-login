import { AuthUser, AuthState, AuthError } from '../types';
export interface UseAuthReturn {
    user: AuthUser | null;
    authState: AuthState;
    error: AuthError | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}
/**
 * Main authentication hook providing user state and actions.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout, openLoginModal } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={openLoginModal}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useAuth(): UseAuthReturn;
