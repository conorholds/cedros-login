import { useState, useCallback, useMemo } from 'react';
import type { PostLoginAction } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';

/**
 * Return type for the usePostLogin hook
 */
export interface UsePostLoginReturn {
  /** The current post-login action from the last auth response, or null */
  postLoginAction: PostLoginAction | null;
  /** Set the post-login action (call after receiving an auth response with postLogin) */
  setPostLoginAction: (action: PostLoginAction | null) => void;
  /** Mark the welcome flow as completed on the server */
  markWelcomeCompleted: () => Promise<void>;
  /** Clear the post-login action (e.g., after handling it) */
  clearPostLogin: () => void;
  /** Whether a markWelcomeCompleted call is in progress */
  isLoading: boolean;
  /** Error from the last markWelcomeCompleted call */
  error: Error | null;
}

/**
 * Hook for managing post-login flow actions.
 *
 * After authentication, the server may return a `postLogin` action indicating
 * the client should show a welcome page, require subscription selection,
 * prompt for profile completion, or redirect to a specific URL.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { postLoginAction, markWelcomeCompleted, clearPostLogin } = usePostLogin();
 *   const { login } = useEmailAuth();
 *
 *   const handleLogin = async () => {
 *     const response = await login(email, password);
 *     if (response.postLogin) {
 *       setPostLoginAction(response.postLogin);
 *     }
 *   };
 *
 *   // MFA setup (highest priority — not skippable)
 *   if (postLoginAction?.action === 'setup_mfa') {
 *     return <MfaSetupPrompt onComplete={clearPostLogin} />;
 *   }
 *
 *   if (postLoginAction?.action === 'enroll_wallet') {
 *     return <WalletEnrollment onComplete={clearPostLogin} />; // from @cedros/wallet-react
 *   }
 *
 *   if (postLoginAction?.action === 'acknowledge_recovery') {
 *     return <RecoveryInfoScreen onComplete={clearPostLogin} />;
 *   }
 *
 *   if (postLoginAction?.action === 'choose_username') {
 *     return <ChooseUsernamePrompt onComplete={clearPostLogin} onSkip={clearPostLogin} />;
 *   }
 *
 *   if (postLoginAction?.action === 'choose_subscription' && postLoginAction.redirectUrl) {
 *     window.location.href = postLoginAction.redirectUrl;
 *   }
 *
 *   if (postLoginAction?.action === 'welcome') {
 *     return <WelcomePage onComplete={async () => {
 *       await markWelcomeCompleted();
 *       clearPostLogin();
 *     }} />;
 *   }
 *
 *   if (postLoginAction?.action === 'complete_profile') {
 *     return <CompleteAccountPrompt onComplete={clearPostLogin} onSkip={clearPostLogin} />;
 *   }
 *
 *   if (postLoginAction?.action === 'redirect' && postLoginAction.redirectUrl) {
 *     window.location.href = postLoginAction.redirectUrl;
 *   }
 * }
 * ```
 */
export function usePostLogin(): UsePostLoginReturn {
  const { config, _internal } = useCedrosLogin();
  const [postLoginAction, setPostLoginAction] = useState<PostLoginAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, _internal]
  );

  const markWelcomeCompleted = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/welcome-completed', {});
    } catch (err) {
      // apiClient rejects with a structured ApiErrorResponse (not an Error);
      // handleApiError extracts the real server message so consumers reading
      // error.message never see "[object Object]".
      const e = new Error(
        handleApiError(err, 'Unable to complete the welcome step. Please try again.').message
      );
      setError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  const clearPostLogin = useCallback(() => {
    setPostLoginAction(null);
  }, []);

  return {
    postLoginAction,
    setPostLoginAction,
    markWelcomeCompleted,
    clearPostLogin,
    isLoading,
    error,
  };
}
