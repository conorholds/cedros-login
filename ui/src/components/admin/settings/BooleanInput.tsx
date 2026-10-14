import { useCallback } from 'react';
interface BooleanInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

export function BooleanInput({ value, onChange, ariaLabel }: BooleanInputProps) {
  const isEnabled = value === 'true';

  const handleToggle = useCallback(() => {
    onChange(isEnabled ? 'false' : 'true');
  }, [isEnabled, onChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      aria-label={ariaLabel}
      className={`cedros-toggle ${isEnabled ? 'cedros-toggle-on' : 'cedros-toggle-off'}`}
      onClick={handleToggle}
    >
      <span className="cedros-toggle-track">
        <span className="cedros-toggle-thumb" />
      </span>
    </button>
  );
}
