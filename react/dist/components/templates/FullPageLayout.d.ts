import { ReactNode } from 'react';
export interface FullPageLayoutProps {
    /** Brand logo element (e.g., an img or svg) */
    brandLogo?: ReactNode;
    /** Brand name displayed next to the logo */
    brandName?: string;
    /** Title displayed above the form. @default "Welcome back" */
    title?: string;
    /** Subtitle displayed below the title. @default "Login with your Apple or Google account" */
    subtitle?: string;
    /** Terms/legal text displayed below the card */
    termsText?: ReactNode;
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
 * Full page login layout with centered card on gradient background.
 * Follows shadcn/ui login block pattern.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FullPageLayout onSuccess={() => navigate('/dashboard')} />
 *
 * // With branding and terms
 * <FullPageLayout
 *   brandLogo={<img src="/logo.svg" alt="" />}
 *   brandName="Acme Inc."
 *   termsText={<>By clicking continue, you agree to our <a href="/terms">Terms</a>.</>}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export declare function FullPageLayout({ brandLogo, brandName, title, subtitle, termsText, onSuccess, defaultTab, children, className, }: FullPageLayoutProps): import("react/jsx-runtime").JSX.Element;
