/**
 * StatsBar Component
 *
 * A reusable horizontal stats display for admin sections.
 */

import { useTranslations } from '../../i18n';
import { AnimatedNumber } from '../shared/AnimatedNumber';

export interface StatItem {
  label: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'muted';
}

export interface StatsBarProps {
  stats: StatItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const Icons = {
  loading: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cedros-admin__spinner"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  refresh: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  ),
};

export function StatsBar({ stats, isLoading = false, onRefresh }: StatsBarProps) {
  const t = useTranslations();
  return (
    <div className="cedros-admin__stats-bar">
      <div className="cedros-admin__stats-bar-grid">
        {stats.map((stat, index) => (
          <div key={index} className="cedros-admin__stats-bar-item">
            <span className="cedros-admin__stats-bar-label">{stat.label}</span>
            <span
              className={`cedros-admin__stats-bar-value ${
                stat.variant ? `cedros-admin__stats-bar-value--${stat.variant}` : ''
              }`}
            >
              {isLoading ? (
                <span className="cedros-admin__skeleton cedros-admin__skeleton--value" />
              ) : typeof stat.value === 'number' ? (
                <AnimatedNumber value={stat.value} />
              ) : (
                stat.value
              )}
            </span>
            {stat.description && (
              <span className="cedros-admin__stats-bar-desc">{stat.description}</span>
            )}
          </div>
        ))}
      </div>
      {onRefresh && (
        <button
          type="button"
          className="cedros-admin__stats-bar-refresh"
          onClick={onRefresh}
          disabled={isLoading}
          title={t.admin.dashboard.refreshStats}
          aria-label={t.admin.dashboard.refreshStats}
        >
          {isLoading ? Icons.loading : Icons.refresh}
        </button>
      )}
    </div>
  );
}
