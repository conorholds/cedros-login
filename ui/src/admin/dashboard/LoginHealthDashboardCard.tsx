import type { ReactNode } from 'react';
import type { HostContext, JsonObject, JsonValue } from '../types';
import type { CedrosDashboardCardContributionProps } from '../../extension/contracts';
import { CEDROS_LOGIN_ADMIN_MODULE_ID } from '../../extension/manifest';
import { CEDROS_LOGIN_ADMIN_SECTION_IDS } from '../adminIds';
import { useI18n } from '../../i18n';
import type { Translations } from '../../i18n';

interface AdminSectionTarget {
  moduleId: string;
  sectionId: string;
}

type NavigateToAdminSection = (target: AdminSectionTarget) => void;
interface GrowthMetric {
  label: string;
  value: string;
  detail?: string;
}

export function LoginHealthDashboardCard({
  hostContext,
  pluginContext,
  extensionId,
  refreshInterval,
  isLoading,
  analyticsSnapshot,
  analyticsError,
}: CedrosDashboardCardContributionProps) {
  const { t, locale, message, number } = useI18n();
  const canReview = canReviewLoginAdmin(pluginContext);
  const navigate = getAdminSectionNavigator(hostContext);
  const hasSnapshot = hasAnalyticsSnapshot(analyticsSnapshot);
  const metrics = userGrowthMetrics(analyticsSnapshot, t, locale);
  const state = dashboardState(isLoading, canReview, Boolean(analyticsError), hasSnapshot);

  return (
    <DashboardCardShell state={state} extensionId={extensionId} t={t}>
      <DashboardCardContent
        state={state}
        navigate={navigate}
        metrics={metrics}
        refreshInterval={refreshInterval}
        hasSnapshot={hasSnapshot}
        t={t}
        message={message}
        number={number}
      />
    </DashboardCardShell>
  );
}

function DashboardCardShell({
  children,
  extensionId,
  state,
  t,
}: {
  children: ReactNode;
  extensionId: string;
  state: 'loading' | 'disabled' | 'error' | 'empty' | 'happy';
  t: Translations;
}) {
  return (
    <section
      aria-label={t.admin.dashboard.cardAriaLabel}
      aria-busy={state === 'loading'}
      className="cedros-login-dashboard-card cedros-data cedros-data-card"
      data-extension-id={extensionId}
      data-state={state}
    >
      <header className="cedros-data-card__header">
        <h3 className="cedros-data-card__title">{t.admin.dashboard.userGrowth}</h3>
        <strong className={`cedros-data-pill ${statePillClass(state)}`.trim()}>
          {stateLabel(state, t)}
        </strong>
      </header>
      <div className="cedros-data-card__body">{children}</div>
    </section>
  );
}

function DashboardCardSkeleton() {
  return (
    <div className="cedros-login-dashboard-card__skeleton" aria-hidden="true">
      <span className="cedros-login-dashboard-card__skeleton-line" />
      <span className="cedros-login-dashboard-card__skeleton-line cedros-login-dashboard-card__skeleton-line--short" />
    </div>
  );
}

function DashboardCardContent({
  state,
  navigate,
  metrics,
  refreshInterval,
  hasSnapshot,
  t,
  message,
  number,
}: {
  state: 'loading' | 'disabled' | 'error' | 'empty' | 'happy';
  navigate: NavigateToAdminSection | null;
  metrics: GrowthMetric[];
  refreshInterval: number;
  hasSnapshot: boolean;
  t: Translations;
  message: ReturnType<typeof useI18n>['message'];
  number: ReturnType<typeof useI18n>['number'];
}) {
  if (state === 'loading') {
    return (
      <>
        <DashboardCardSkeleton />
        <p>{t.admin.dashboard.checkingGrowth}</p>
      </>
    );
  }

  if (state === 'disabled') return <DashboardCapabilityNotice navigate={navigate} t={t} />;
  if (state === 'error') return <DashboardErrorNotice navigate={navigate} t={t} />;

  return (
    <>
      <p className={hasSnapshot ? undefined : 'cedros-data-empty'}>
        {hasSnapshot ? t.admin.dashboard.analyticsConnected : t.admin.dashboard.analyticsMissing}
      </p>
      <DashboardMetrics metrics={metrics} />
      <p>{formatRefresh(refreshInterval, t, message, number)}</p>
      <CardAction navigate={navigate} t={t} />
    </>
  );
}

function DashboardCapabilityNotice({
  navigate,
  t,
}: {
  navigate: NavigateToAdminSection | null;
  t: Translations;
}) {
  return (
    <div className="cedros-data-setup-notice">
      <div className="cedros-data-setup-notice__body">
        <p>{t.admin.dashboard.permissionNeededBody}</p>
      </div>
      <div className="cedros-data-actions">
        <CardAction navigate={navigate} t={t} />
      </div>
    </div>
  );
}

function DashboardErrorNotice({
  navigate,
  t,
}: {
  navigate: NavigateToAdminSection | null;
  t: Translations;
}) {
  return (
    <div className="cedros-data-status cedros-data-status--error" role="alert">
      <p>{t.admin.dashboard.analyticsUnavailable}</p>
      <div className="cedros-data-status__actions">
        <CardAction navigate={navigate} t={t} />
      </div>
    </div>
  );
}

function DashboardMetrics({ metrics }: { metrics: GrowthMetric[] }) {
  if (metrics.length === 0) return null;

  return (
    <dl className="cedros-data-summary-grid cedros-login-dashboard-card__metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className="cedros-data-metric cedros-login-dashboard-card__metric">
          <dt className="cedros-data-metric__label">{metric.label}</dt>
          <dd className="cedros-data-metric__value">{metric.value}</dd>
          {metric.detail && <span className="cedros-data-metric__hint">{metric.detail}</span>}
        </div>
      ))}
    </dl>
  );
}

function CardAction({ navigate, t }: { navigate: NavigateToAdminSection | null; t: Translations }) {
  return (
    <button
      type="button"
      className="cedros-data-btn cedros-data-btn--secondary cedros-data-btn--sm"
      disabled={!navigate}
      data-module-id={CEDROS_LOGIN_ADMIN_MODULE_ID}
      data-section-id={CEDROS_LOGIN_ADMIN_SECTION_IDS.users}
      onClick={() =>
        navigate?.({
          moduleId: CEDROS_LOGIN_ADMIN_MODULE_ID,
          sectionId: CEDROS_LOGIN_ADMIN_SECTION_IDS.users,
        })
      }
    >
      {t.admin.dashboard.reviewAccounts}
    </button>
  );
}

function dashboardState(
  isLoading: boolean,
  canReview: boolean,
  hasError: boolean,
  hasSnapshot: boolean
) {
  if (isLoading) return 'loading';
  if (!canReview) return 'disabled';
  if (hasError) return 'error';
  return hasSnapshot ? 'happy' : 'empty';
}

function canReviewLoginAdmin(pluginContext: CedrosDashboardCardContributionProps['pluginContext']) {
  return (
    pluginContext.hasPermission('manage_users') || pluginContext.hasPermission('manage_settings')
  );
}

function getAdminSectionNavigator(hostContext: HostContext): NavigateToAdminSection | null {
  const candidate = hostContext.custom?.navigateToAdminSection;
  return typeof candidate === 'function' ? (candidate as NavigateToAdminSection) : null;
}

function hasAnalyticsSnapshot(snapshot: JsonValue | null) {
  const record = asJsonObject(snapshot);
  return Boolean(record && Object.keys(record).length > 0);
}

function userGrowthMetrics(
  snapshot: CedrosDashboardCardContributionProps['analyticsSnapshot'],
  t: Translations,
  locale: string
): GrowthMetric[] {
  const record = asJsonObject(snapshot);
  if (!record) return [];

  const totalAccounts = firstNumber(record, [
    ['accounts', 'total'],
    ['users', 'total'],
    ['totals', 'accounts'],
    ['totals', 'users'],
    ['totalAccounts'],
    ['totalUsers'],
  ]);
  const new7d = firstNumber(record, [
    ['growth', 'newAccounts7d'],
    ['growth', 'newUsers7d'],
    ['accounts', 'new7d'],
    ['users', 'new7d'],
    ['newAccounts7d'],
    ['newUsers7d'],
  ]);
  const new30d = firstNumber(record, [
    ['growth', 'newAccounts30d'],
    ['growth', 'newUsers30d'],
    ['accounts', 'new30d'],
    ['users', 'new30d'],
    ['newAccounts30d'],
    ['newUsers30d'],
  ]);
  const verifiedRate =
    firstPercent(record, [
      ['accounts', 'verifiedRate'],
      ['users', 'verifiedRate'],
      ['verifiedRate'],
      ['emailVerifiedRate'],
    ]) ??
    ratioPercent(
      firstNumber(record, [
        ['accounts', 'verified'],
        ['users', 'verified'],
      ]),
      totalAccounts
    );
  const active7d = firstNumber(record, [
    ['activity', 'activeLogins7d'],
    ['logins', 'active7d'],
    ['totals', 'authenticated'],
    ['activeLogins7d'],
  ]);
  const inviteAcceptance =
    firstPercent(record, [
      ['invites', 'acceptanceRate'],
      ['teamInvites', 'acceptanceRate'],
      ['inviteAcceptanceRate'],
    ]) ??
    ratioPercent(
      firstNumber(record, [
        ['invites', 'accepted'],
        ['teamInvites', 'accepted'],
      ]),
      firstNumber(record, [
        ['invites', 'sent'],
        ['teamInvites', 'sent'],
      ])
    );
  const providerMix = providerMixSummary(record, locale);

  return [
    metric(t.admin.dashboard.totalAccounts, totalAccounts, locale),
    metric(
      t.admin.dashboard.new7d,
      new7d,
      locale,
      new7d === null ? undefined : t.admin.dashboard.accountsDetail
    ),
    metric(
      t.admin.dashboard.new30d,
      new30d,
      locale,
      new30d === null ? undefined : t.admin.dashboard.accountsDetail
    ),
    percentMetric(t.admin.dashboard.verified, verifiedRate, locale),
    metric(
      t.admin.dashboard.active7d,
      active7d,
      locale,
      active7d === null ? undefined : t.admin.dashboard.loginsDetail
    ),
    percentMetric(t.admin.dashboard.inviteAcceptance, inviteAcceptance, locale),
    providerMix ? { label: t.admin.dashboard.providerMix, value: providerMix } : null,
  ].filter((item): item is GrowthMetric => item !== null);
}

function metric(
  label: string,
  value: number | null,
  locale: string,
  detail?: string
): GrowthMetric | null {
  if (value === null) return null;
  return { label, value: formatCount(value, locale), detail };
}

function percentMetric(label: string, value: number | null, locale: string): GrowthMetric | null {
  if (value === null) return null;
  return {
    label,
    value: new Intl.NumberFormat(locale, { maximumFractionDigits: 0, style: 'percent' }).format(
      value / 100
    ),
  };
}

function firstNumber(root: JsonObject, paths: string[][]): number | null {
  for (const path of paths) {
    const value = numberValue(readPath(root, path));
    if (value !== null) return value;
  }
  return null;
}

function firstPercent(root: JsonObject, paths: string[][]): number | null {
  for (const path of paths) {
    const value = percentValue(readPath(root, path));
    if (value !== null) return value;
  }
  return null;
}

function ratioPercent(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator <= 0) return null;
  return Math.min(100, Math.max(0, (numerator / denominator) * 100));
}

function providerMixSummary(root: JsonObject, locale: string): string | null {
  const mix =
    asJsonObject(root.providerMix) ??
    asJsonObject(root.authProviders) ??
    asJsonObject(root.providers);
  if (!mix) return null;
  const entries = Object.entries(mix)
    .map(([provider, value]) => [provider, numberValue(value)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] !== null)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 2);
  if (!entries.length) return null;
  return entries
    .map(([provider, value]) => `${titleCase(provider, locale)} ${formatCount(value, locale)}`)
    .join(', ');
}

function readPath(root: JsonObject, path: string[]): JsonValue | undefined {
  let current: JsonValue | undefined = root;
  for (const segment of path) {
    const record = asJsonObject(current);
    if (!record) return undefined;
    current = record[segment];
  }
  return current;
}

function numberValue(value: JsonValue | undefined): number | null {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return typeof numericValue === 'number' && Number.isFinite(numericValue) && numericValue >= 0
    ? numericValue
    : null;
}

function percentValue(value: JsonValue | undefined): number | null {
  const numericValue = numberValue(value);
  if (numericValue === null) return null;
  return numericValue <= 1 ? numericValue * 100 : Math.min(100, numericValue);
}

function asJsonObject(value: JsonValue | undefined | null): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function formatRefresh(
  refreshInterval: number,
  t: Translations,
  message: (
    template: string,
    values?: Record<string, string | number | boolean | null | undefined>
  ) => string,
  number: (value: number, options?: Intl.NumberFormatOptions) => string
) {
  if (!Number.isFinite(refreshInterval) || refreshInterval <= 0)
    return t.admin.dashboard.refreshesWithDashboard;
  return message(t.admin.dashboard.refreshesEverySeconds, {
    seconds: number(Math.round(refreshInterval / 1000)),
  });
}

function titleCase(value: string, locale: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\p{L}/gu, (character) => character.toLocaleUpperCase(locale));
}

function stateLabel(state: 'loading' | 'disabled' | 'error' | 'empty' | 'happy', t: Translations) {
  const labels = {
    loading: t.common.loading,
    disabled: t.admin.dashboard.permissionNeeded,
    error: t.admin.dashboard.unavailable,
    empty: t.admin.dashboard.awaitingData,
    happy: t.admin.dashboard.ready,
  };
  return labels[state];
}

function statePillClass(state: 'loading' | 'disabled' | 'error' | 'empty' | 'happy') {
  const classes = {
    loading: 'cedros-data-pill--info',
    disabled: 'cedros-data-pill--warning',
    error: 'cedros-data-pill--error',
    empty: 'cedros-data-pill--info',
    happy: 'cedros-data-pill--success',
  };
  return classes[state];
}
