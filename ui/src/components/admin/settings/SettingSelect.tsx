/**
 * Settings value selector using the documented Cedros admin native-select contract.
 *
 * The host owns the open menu chrome. This keeps the control keyboard-native and
 * avoids clipping inside scrollable admin containers while preserving the same
 * selected value and `onChange(value)` API used by settings fields.
 */
export interface SettingSelectOption {
  label: string;
  value: string;
}

export interface SettingSelectProps {
  value: string;
  options: SettingSelectOption[];
  onChange: (value: string) => void;
  /** Accessible label for the select. */
  ariaLabel?: string;
  /** Shown when the value matches no option. */
  placeholder?: string;
}

export function SettingSelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
}: SettingSelectProps) {
  const selected = options.some((option) => option.value === value);
  const unmatchedLabel = placeholder ?? value;

  return (
    <select
      className="cedros-data-select cedros-setting-select"
      value={selected ? value : ''}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
    >
      {!selected && (
        <option value="" disabled>
          {unmatchedLabel}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
