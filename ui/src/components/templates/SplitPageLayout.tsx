import type { ReactNode } from 'react';
import { LoginForm } from '../LoginForm';
import { useI18n } from '../../i18n';

export interface SplitPageLayoutProps {
  /** Brand name or logo text displayed on the left panel */
  brandName?: string;
  /** Brand logo element (replaces default logo) */
  brandLogo?: ReactNode;
  /** Tagline displayed below the brand name */
  tagline?: string;
  /** Title displayed above the form. @default "Sign in" */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Called when login/register succeeds */
  onSuccess?: () => void;
  /** Default tab for the form. @default "login" */
  defaultTab?: 'login' | 'register';
  /** Custom content to render instead of LoginForm */
  children?: ReactNode;
  /** Additional CSS class for the outer container */
  className?: string;
}

/**
 * Split page login layout with branding on the left and form on the right.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SplitPageLayout
 *   brandName="MyApp"
 *   tagline="The best app for everything"
 *   onSuccess={() => navigate('/dashboard')}
 * />
 *
 * // With custom logo
 * <SplitPageLayout
 *   brandLogo={<img src="/logo.svg" alt="MyApp" />}
 *   brandName="MyApp"
 *   tagline="Enterprise-grade solutions"
 *   title="Welcome back"
 *   subtitle="Sign in to continue"
 * />
 * ```
 */
export function SplitPageLayout({
  brandName,
  brandLogo,
  tagline,
  title,
  subtitle,
  onSuccess,
  defaultTab = 'login',
  children,
  className = '',
}: SplitPageLayoutProps) {
  const { t, locale } = useI18n();
  const resolvedBrandName = brandName ?? t.auth.defaultBrandName;
  const resolvedTagline = tagline ?? t.auth.defaultTagline;
  const resolvedTitle = title ?? t.buttons.signIn;
  const resolvedSubtitle = subtitle ?? t.auth.defaultSubtitle;

  return (
    <div className={`cedros-split-page-layout ${className}`}>
      {/* Left side - Branding */}
      <div className="cedros-split-page-brand">
        <div className="cedros-split-page-brand-content">
          {brandLogo ?? (
            <div className="cedros-split-page-logo">
              {resolvedBrandName.charAt(0).toLocaleUpperCase(locale)}
            </div>
          )}
          <h1 className="cedros-split-page-brand-name">{resolvedBrandName}</h1>
          {resolvedTagline && <p className="cedros-split-page-tagline">{resolvedTagline}</p>}
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="cedros-split-page-form">
        <div className="cedros-split-page-form-content">
          <h2 className="cedros-split-page-title">{resolvedTitle}</h2>
          {resolvedSubtitle && <p className="cedros-split-page-subtitle">{resolvedSubtitle}</p>}
          {children ?? <LoginForm defaultTab={defaultTab} onSuccess={onSuccess} />}
        </div>
      </div>
    </div>
  );
}
