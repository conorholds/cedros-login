import { ReactNode } from 'react';
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
export declare function SplitPageLayout({ brandName, brandLogo, tagline, title, subtitle, onSuccess, defaultTab, children, className, }: SplitPageLayoutProps): import("react/jsx-runtime").JSX.Element;
