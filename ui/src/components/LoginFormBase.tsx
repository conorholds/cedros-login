import { SignupPlanStep } from './signup/SignupPlanStep';
import { useExternalEffect } from '../hooks/effects';
import { useCurrentSignupAvailability } from '../hooks/useCurrentSignupAvailability';
import { Fragment, useId, useState, useCallback, type ReactNode } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { EmailLoginForm } from './email/EmailLoginForm';
import { EmailRegisterForm } from './email/EmailRegisterForm';
import { ForgotPasswordForm } from './email/ForgotPasswordForm';
import { GoogleLoginButton } from './google/GoogleLoginButton';
import { AppleLoginButton } from './apple/AppleLoginButton';
import { PasskeyLoginButton } from './webauthn/PasskeyLoginButton';
import { TotpVerify } from './totp/TotpVerify';
import { ErrorMessage } from './shared/ErrorMessage';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { SignupAvailabilityNotice } from './shared/SignupAvailabilityNotice';
import { DirectionalPanel } from './shared/MotionPrimitives';
import { useServerFeatures } from '../hooks/useServerFeatures';
import { useI18n } from '../i18n';
import type { AuthResponse, MfaRequiredResponse } from '../types';

type TabValue = 'login' | 'register';
type ViewState = 'form' | 'forgotPassword';
type SocialProviderId = 'webauthn' | 'google' | 'apple' | 'solana';
type SocialButton = { id: SocialProviderId; element: ReactNode };

const TABS: TabValue[] = ['login', 'register'];
const DEFAULT_SOCIAL_BUTTON_ORDER: SocialProviderId[] = ['webauthn', 'google', 'apple', 'solana'];

export interface LoginFormProps {
  onSuccess?: (response?: AuthResponse) => void;
  className?: string;
  defaultTab?: 'login' | 'register';
  /** Enable the hosted Pay plan-selection step when the site requires a subscription. */
  signupPlanSelection?: boolean;
}

export interface SolanaButtonRenderProps {
  onSuccess?: (response?: AuthResponse) => void;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: Error) => void;
  accessCode?: string;
}

interface LoginFormBaseProps extends LoginFormProps {
  getHasWallets?: () => boolean;
  renderSolanaButton?: (props: SolanaButtonRenderProps) => ReactNode;
}

export function LoginFormBase({
  onSuccess,
  className = '',
  defaultTab = 'login',
  signupPlanSelection = false,
  getHasWallets,
  renderSolanaButton,
}: LoginFormBaseProps) {
  const { config, socialButtonOrder, isFeatureEnabled, user, authState, logout } = useCedrosLogin();
  const { t, message } = useI18n();
  const formId = useId();
  const { features: serverFeatures } = useServerFeatures();
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  // The quota banner is for new signups, not an account already awaiting its next step.
  const [registrationAdvanced, setRegistrationAdvanced] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('form');
  const [hasWallets, setHasWallets] = useState(() => (getHasWallets ? getHasWallets() : false));
  const [accessCode, setAccessCode] = useState('');
  const [registrationPending, setRegistrationPending] = useState(false);
  useExternalEffect(() => {
    if (activeTab === 'login') setRegistrationPending(false);
  }, [activeTab]);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialMfaToken, setSocialMfaToken] = useState<string | null>(null);

  const signupAccessCodeRequired =
    config.signupAccessCodeRequired ?? serverFeatures?.signupAccessCodeRequired ?? false;
  const signupAvailability = useCurrentSignupAvailability(config.signupAvailability);
  const isCheckingSession = authState === 'idle' || authState === 'loading';
  const signedInLabel = user?.email ?? user?.name ?? user?.username ?? user?.id ?? '';

  const handleSocialError = useCallback((err: Error) => {
    setSocialError(err.message);
  }, []);

  const handleSocialMfaRequired = useCallback((response: MfaRequiredResponse) => {
    setSocialError(null);
    setSocialMfaToken(response.mfaToken);
  }, []);

  useExternalEffect(() => {
    if (!getHasWallets) {
      return;
    }

    const updateWallets = () => setHasWallets(getHasWallets());
    updateWallets();
    window.addEventListener('load', updateWallets);
    window.addEventListener('focus', updateWallets);

    return () => {
      window.removeEventListener('load', updateWallets);
      window.removeEventListener('focus', updateWallets);
    };
  }, [getHasWallets]);

  const forgotPasswordMode =
    config.forms?.forgotPassword?.mode ??
    (isFeatureEnabled('instantLink') ? 'instantLink' : 'reset');

  const selectTab = useCallback(
    (tab: TabValue) => {
      if (tab !== activeTab) setRegistrationAdvanced(false);
      setActiveTab(tab);
    },
    [activeTab]
  );

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = TABS.indexOf(activeTab);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = currentIndex === 0 ? TABS.length - 1 : currentIndex - 1;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = currentIndex === TABS.length - 1 ? 0 : currentIndex + 1;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const newTab = TABS[newIndex];
      selectTab(newTab);
      const newButton = document.getElementById(`${formId}-tab-${newTab}`);
      newButton?.focus();
    },
    [activeTab, formId, selectTab]
  );

  if (isCheckingSession) {
    return (
      <div className="cedros-login-form-shell">
        <div className={`cedros-login-form ${className}`}>
          <div className="cedros-login-session-status" role="status" aria-live="polite">
            <LoadingSpinner size="sm" />
            <span className="cedros-login-session-message">{t.common.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'authenticated' && user) {
    return (
      <div className="cedros-login-form-shell">
        <div className={`cedros-login-form ${className}`}>
          <div className="cedros-login-session-status">
            <h2 className="cedros-login-session-title">{t.auth.signedIn}</h2>
            {signedInLabel && (
              <p className="cedros-login-session-message">
                {message(t.auth.continueAs, { account: signedInLabel })}
              </p>
            )}
            <div className="cedros-login-session-actions">
              <a className="cedros-button cedros-button-primary cedros-button-md" href="/profile">
                {t.buttons.manageAccount}
              </a>
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-md"
                onClick={() => void logout()}
              >
                {t.buttons.signOut}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (socialMfaToken) {
    return (
      <div className="cedros-login-form-shell">
        <div className={`cedros-login-form ${className}`}>
          <TotpVerify
            mfaToken={socialMfaToken}
            onSuccess={(response) => {
              setSocialMfaToken(null);
              onSuccess?.(response);
            }}
            onBack={() => setSocialMfaToken(null)}
          />
        </div>
      </div>
    );
  }

  const showEmail = isFeatureEnabled('email');
  const showGoogle = isFeatureEnabled('google') && config.googleClientId;
  const showApple = isFeatureEnabled('apple') && config.appleClientId;
  const showSolana = Boolean(renderSolanaButton) && isFeatureEnabled('solana') && hasWallets;
  const showPasskey = isFeatureEnabled('webauthn');
  const activeAccessCode = activeTab === 'register' ? accessCode || undefined : undefined;
  const socialButtonOrderIds = normalizeSocialButtonOrder(socialButtonOrder);
  const socialButtons = [
    showPasskey
      ? socialButton(
          'webauthn',
          <PasskeyLoginButton
            key={activeTab}
            mode={activeTab}
            onSuccess={onSuccess}
            onMfaRequired={handleSocialMfaRequired}
            onError={handleSocialError}
            accessCode={activeAccessCode}
          />
        )
      : null,
    showGoogle
      ? socialButton(
          'google',
          <GoogleLoginButton
            onSuccess={onSuccess}
            onMfaRequired={handleSocialMfaRequired}
            onError={handleSocialError}
            accessCode={activeAccessCode}
          />
        )
      : null,
    showApple
      ? socialButton(
          'apple',
          <AppleLoginButton
            onSuccess={onSuccess}
            onMfaRequired={handleSocialMfaRequired}
            onError={handleSocialError}
            accessCode={activeAccessCode}
          />
        )
      : null,
    showSolana
      ? socialButton(
          'solana',
          renderSolanaButton?.({
            onSuccess,
            onMfaRequired: handleSocialMfaRequired,
            onError: handleSocialError,
            accessCode: activeAccessCode,
          })
        )
      : null,
  ]
    .filter(isSocialButton)
    .sort(
      (left, right) =>
        socialButtonIndex(left.id, socialButtonOrderIds) -
        socialButtonIndex(right.id, socialButtonOrderIds)
    );
  const showDivider = showEmail && socialButtons.length > 0;

  if (!showEmail && socialButtons.length === 0) {
    return (
      <div className="cedros-login-form-shell">
        <div className={`cedros-login-form ${className}`}>
          <div className="cedros-login-session-status" role="status">
            <h2 className="cedros-login-session-title">{t.auth.signInUnavailableTitle}</h2>
            <p className="cedros-login-session-message">{t.auth.signInUnavailableBody}</p>
          </div>
        </div>
      </div>
    );
  }

  const form = (
    <DirectionalPanel stateKey={viewState} order={['form', 'forgotPassword']} focusOnChange>
      {viewState === 'forgotPassword' ? (
        <div className={`cedros-login-form ${className}`}>
          <ForgotPasswordForm mode={forgotPasswordMode} onCancel={() => setViewState('form')} />
        </div>
      ) : (
        <div className="cedros-login-form-shell">
          <div className={`cedros-login-form ${className}`}>
            {activeTab === 'register' && !registrationAdvanced && (
              <SignupAvailabilityNotice availability={signupAvailability} />
            )}
            {signupAccessCodeRequired &&
              activeTab === 'register' &&
              !registrationAdvanced &&
              signupAvailability?.remaining !== 0 && (
                <div className="cedros-form-field">
                  <label htmlFor={`${formId}-login-form-access-code`} className="cedros-label">
                    {t.auth.accessCode}
                  </label>
                  <input
                    id={`${formId}-login-form-access-code`}
                    type="text"
                    className="cedros-input"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder={t.auth.enterAccessCode}
                    aria-required="true"
                    autoComplete="off"
                  />
                </div>
              )}

            {socialButtons.length > 0 && (
              <div className="cedros-social-buttons">
                {socialButtons.map(({ id, element }) => (
                  <Fragment key={id}>{element}</Fragment>
                ))}
              </div>
            )}

            {showDivider && (
              <div className="cedros-divider">
                <span>{t.messages.orContinueWith}</span>
              </div>
            )}

            {(showEmail || showPasskey) && (
              <>
                <div className="cedros-tabs" role="tablist" aria-label={t.auth.authMethodAriaLabel}>
                  <button
                    type="button"
                    role="tab"
                    id={`${formId}-tab-login`}
                    className={`cedros-tab ${activeTab === 'login' ? 'cedros-tab-active' : ''}`}
                    onClick={() => selectTab('login')}
                    onKeyDown={handleTabKeyDown}
                    aria-selected={activeTab === 'login'}
                    aria-controls={`${formId}-tabpanel-login`}
                    tabIndex={activeTab === 'login' ? 0 : -1}
                  >
                    {t.auth.tabs.signIn}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id={`${formId}-tab-register`}
                    className={`cedros-tab ${activeTab === 'register' ? 'cedros-tab-active' : ''}`}
                    onClick={() => selectTab('register')}
                    onKeyDown={handleTabKeyDown}
                    aria-selected={activeTab === 'register'}
                    aria-controls={`${formId}-tabpanel-register`}
                    tabIndex={activeTab === 'register' ? 0 : -1}
                  >
                    {t.auth.tabs.signUp}
                  </button>
                </div>

                <DirectionalPanel stateKey={activeTab} order={TABS}>
                  <div
                    role="tabpanel"
                    id={`${formId}-tabpanel-${activeTab}`}
                    aria-labelledby={`${formId}-tab-${activeTab}`}
                  >
                    {!showEmail ? null : activeTab === 'login' ? (
                      <EmailLoginForm
                        onSuccess={onSuccess}
                        onSwitchToRegister={() => selectTab('register')}
                        onForgotPassword={() => setViewState('forgotPassword')}
                      />
                    ) : (
                      <EmailRegisterForm
                        onSuccess={onSuccess}
                        onAccountCreated={() => setRegistrationAdvanced(true)}
                        onSwitchToLogin={() => selectTab('login')}
                        accessCode={signupAccessCodeRequired ? accessCode : undefined}
                        showSignupAvailability={false}
                        onRegistrationPendingChange={setRegistrationPending}
                      />
                    )}
                  </div>
                </DirectionalPanel>
              </>
            )}
          </div>

          {socialError && (
            <ErrorMessage error={socialError} onDismiss={() => setSocialError(null)} />
          )}
        </div>
      )}
    </DirectionalPanel>
  );
  return (
    <SignupPlanStep
      enabled={signupPlanSelection && activeTab === 'register' && viewState === 'form'}
      serverUrl={config.serverUrl}
      locked={registrationPending}
      onSignIn={() => setActiveTab('login')}
    >
      {form}
    </SignupPlanStep>
  );
}

function socialButton(id: SocialProviderId, element: ReactNode): SocialButton | null {
  return element === null || element === undefined || element === false ? null : { id, element };
}

function isSocialButton(value: SocialButton | null): value is SocialButton {
  return value !== null;
}

function normalizeSocialButtonOrder(order?: string[]): SocialProviderId[] {
  if (!Array.isArray(order)) return DEFAULT_SOCIAL_BUTTON_ORDER;
  const normalized = order
    .map((id) => (id === 'passkey' ? 'webauthn' : id))
    .filter(isSocialProviderId);
  return normalized.length ? normalized : DEFAULT_SOCIAL_BUTTON_ORDER;
}

function isSocialProviderId(value: string): value is SocialProviderId {
  return DEFAULT_SOCIAL_BUTTON_ORDER.includes(value as SocialProviderId);
}

function socialButtonIndex(id: SocialProviderId, order: SocialProviderId[]): number {
  const index = order.indexOf(id);
  return index === -1 ? order.length : index;
}
