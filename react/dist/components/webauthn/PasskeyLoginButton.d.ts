import { ReactNode } from 'react';
export interface PasskeyLoginButtonProps {
    onSuccess?: () => void;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
}
export declare function PasskeyLoginButton({ onSuccess, className, children, disabled, }: PasskeyLoginButtonProps): import("react/jsx-runtime").JSX.Element;
