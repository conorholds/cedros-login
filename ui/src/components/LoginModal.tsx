import { useModalFocus } from '../hooks/useModalFocus';
import { useId, useRef } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { LoginForm } from './LoginForm';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { useTranslations } from '../i18n';

export interface LoginModalProps {
  className?: string;
  title?: string;
}

/**
 * Modal containing the login form.
 * Controlled by the CedrosLoginProvider context.
 */
export function LoginModal({ className = '', title }: LoginModalProps) {
  const t = useTranslations();
  const { isModalOpen, closeModal } = useCedrosLogin();
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalFocus(isModalOpen, modalRef, closeModal);

  if (!isModalOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className={`cedros-modal-backdrop ${className}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="cedros-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="cedros-modal-header">
          <h2 id={titleId} className="cedros-modal-title">
            {title ?? t.auth.signInToAccount}
          </h2>
          <button
            type="button"
            className="cedros-modal-close"
            onClick={closeModal}
            aria-label={t.auth.close}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/* M-06: ErrorBoundary catches rendering errors in login form */}
        <div className="cedros-modal-content">
          <ErrorBoundary>
            <LoginForm onSuccess={closeModal} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
