export interface MenuItemConfig {
    /** Label to display */
    label: string;
    /** Click handler */
    onClick: () => void;
    /** Optional icon element */
    icon?: React.ReactNode;
}
export interface LoginButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
    /** Custom menu items to show above "Sign out" */
    menuItems?: MenuItemConfig[];
    /** Hide the default "Sign out" item (default: false) */
    hideSignOut?: boolean;
}
/**
 * Login button that opens the login modal when clicked.
 * Shows user info when authenticated.
 */
export declare function LoginButton({ className, variant, size, children, menuItems, hideSignOut, }: LoginButtonProps): import("react/jsx-runtime").JSX.Element;
