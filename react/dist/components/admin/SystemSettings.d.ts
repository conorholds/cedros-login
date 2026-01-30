export interface SystemSettingsProps {
    /** Whether to show section descriptions */
    showDescriptions?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Callback when settings are saved */
    onSave?: () => void;
}
/**
 * System settings management component for administrators.
 *
 * Features:
 * - Duration inputs with human-readable display
 * - Percentage sliders
 * - Preset dropdown selectors
 * - Warning indicators for extreme values
 * - Rich descriptions for each setting
 */
export declare function SystemSettings({ showDescriptions, className, onSave, }: SystemSettingsProps): import("react/jsx-runtime").JSX.Element;
