export interface EmailRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    className?: string;
}
/** Values collected from the registration form (for callback) */
export interface RegistrationData {
    termsAccepted: boolean;
    emailOptIn: boolean;
}
/**
 * Email/password registration form
 */
export declare function EmailRegisterForm({ onSuccess, onSwitchToLogin, className, }: EmailRegisterFormProps): import("react/jsx-runtime").JSX.Element;
