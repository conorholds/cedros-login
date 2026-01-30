export interface LoginFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultTab?: 'login' | 'register';
}
/**
 * Combined login form with all enabled auth methods
 */
export declare function LoginForm({ onSuccess, className, defaultTab }: LoginFormProps): import("react/jsx-runtime").JSX.Element;
