import { DepositConfigResponse } from '../../types/deposit';
export interface FeeConfigDisplayProps {
    /** Deposit configuration with fee settings */
    config: DepositConfigResponse;
    /** Show detailed fee breakdown (default: true) */
    showBreakdown?: boolean;
    /** Show tier-specific context (which fees apply to which tier) */
    showTierContext?: boolean;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Fee configuration display with warnings
 */
export declare function FeeConfigDisplay({ config, showBreakdown, showTierContext, className, }: FeeConfigDisplayProps): import("react/jsx-runtime").JSX.Element;
