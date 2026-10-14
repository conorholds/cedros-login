import { useI18n } from '../../i18n';
import { useCountUp } from '../../hooks/useCountUp';

export interface AnimatedNumberProps {
  /** Final value the count-up settles on. */
  value: number;
  /**
   * Formats each displayed frame (default: locale-rounded integer).
   * Must accept intermediate fractional values during the count-up.
   */
  format?: (value: number) => string;
  /** Count-up length in milliseconds. */
  duration?: number;
  className?: string;
}

/**
 * Count-up metric display for dashboard stats. Animates toward `value` on
 * mount and whenever the value changes, then renders the exact final value.
 * Respects prefers-reduced-motion by snapping immediately (via useCountUp).
 */
export function AnimatedNumber({ value, format, duration = 900, className }: AnimatedNumberProps) {
  const { number } = useI18n();
  const display = useCountUp(value, duration);
  const formatted = format ? format(display) : number(Math.round(display));
  return <span className={className}>{formatted}</span>;
}
