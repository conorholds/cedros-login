import { DepositConfigResponse } from '../../types/deposit';
export interface TieredAmountSliderProps {
    /** Deposit configuration with tier thresholds */
    config: DepositConfigResponse;
    /** Current amount in USD */
    valueUsd: number;
    /** Amount change handler */
    onChange: (valueUsd: number) => void;
    /** Cap in USD (default: 10000) */
    maxUsd?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Tiered amount input with deposit tier indicator
 */
export declare function TieredAmountSlider({ config, valueUsd, onChange, maxUsd, disabled, className, }: TieredAmountSliderProps): import("react/jsx-runtime").JSX.Element;
