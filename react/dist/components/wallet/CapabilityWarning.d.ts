import { CryptoCapabilities } from '../../crypto';
export interface CapabilityWarningProps {
    /** Capability check results */
    capabilities: CryptoCapabilities;
    /** Optional class name */
    className?: string;
}
/**
 * Warning display for missing capabilities
 */
export declare function CapabilityWarning({ capabilities, className }: CapabilityWarningProps): import("react/jsx-runtime").JSX.Element | null;
