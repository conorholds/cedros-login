import { Token } from './tokens';
export interface TokenSelectorProps {
    /** List of available tokens */
    tokens: Token[];
    /** Currently selected token */
    selectedToken?: Token;
    /** Callback when token is selected */
    onSelect: (token: Token) => void;
    /** Signal to force-open the dropdown */
    openSignal?: number;
    /** Placeholder text when no token selected */
    placeholder?: string;
    /** Disable the selector */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Show search input */
    searchable?: boolean;
}
/**
 * Token selector dropdown component
 */
export declare function TokenSelector({ tokens, selectedToken, onSelect, openSignal, placeholder, disabled, className, searchable, }: TokenSelectorProps): import("react/jsx-runtime").JSX.Element;
