import { useRef, useState, type ReactNode } from 'react';
import { useExternalEffect } from '../../hooks/effects';
import { formatMessage, useLocale, useTranslations } from '../../i18n';
import {
  loadSignupPlans,
  selectedPlanContinuation,
  signupPlanReturnTo,
  type SignupPlan,
  type SignupBillingPeriod,
} from '../../utils/signupPlans';

/** A preference step; Pay still owns price validation, payment, and entitlement. */
export function SignupPlanStep({
  enabled,
  serverUrl,
  locked = false,
  onSignIn,
  children,
}: {
  enabled: boolean;
  serverUrl: string;
  locked?: boolean;
  onSignIn: () => void;
  children: ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof loadSignupPlans>>>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [period, setPeriod] = useState<SignupBillingPeriod>('monthly');
  const [selected, setSelected] = useState<SignupPlan | null>(null);
  const [choosing, setChoosing] = useState(true);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusAfterChoice = useRef(false);
  useExternalEffect(() => {
    if (!enabled) return;
    let active = true;
    setStatus('loading');
    void loadSignupPlans(serverUrl, window.location.href)
      .then((value) => {
        if (!active) return;
        setCatalog(value);
        setSelected(null);
        setChoosing(true);
        if (value) {
          setPeriod(value.monthly.length ? 'monthly' : 'annual');
          const continuation = selectedPlanContinuation(value.route, window.location.href);
          if (continuation) {
            const url = new URL(continuation, window.location.href);
            const billing = url.searchParams.get('billing') === 'annual' ? 'annual' : 'monthly';
            const plan = value[billing].find(
              (plan) => plan.planId === url.searchParams.get('plan')
            );
            if (plan) {
              saveSelection(value.route, plan, billing);
              setPeriod(billing);
              setSelected(plan);
              setChoosing(false);
            }
          }
        }
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [enabled, serverUrl, attempt]);
  useExternalEffect(() => {
    if (!focusAfterChoice.current) return;
    (choosing ? titleRef.current : summaryRef.current)?.focus();
    focusAfterChoice.current = false;
  }, [choosing]);

  if (!enabled) return <>{children}</>;
  if (status === 'loading') return <p role="status">{t.signupPlans.loading}</p>;
  if (status === 'ready' && !catalog) return <>{children}</>;
  const price = (plan: SignupPlan) =>
    formatMessage(
      plan.interval === 'yearly' ? t.signupPlans.annualPrice : t.signupPlans.monthlyPrice,
      {
        amount: new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: plan.currency,
        }).format(plan.priceCents / 100),
      },
      locale
    );
  const choose = (plan: SignupPlan) => {
    if (!catalog || locked) return;
    saveSelection(catalog.route, plan, period);
    setSelected(plan);
    focusAfterChoice.current = true;
    setChoosing(false);
  };
  return (
    <div className="cedros-signup-plans" style={{ lineHeight: 1.5 }}>
      {selected ? (
        <div hidden={choosing}>
          <p role="status" tabIndex={-1} ref={summaryRef}>
            <strong>{selected.displayName}</strong> · {price(selected)}
          </p>
          {!locked ? (
            <button
              type="button"
              className="cedros-link"
              onClick={() => {
                focusAfterChoice.current = true;
                setChoosing(true);
              }}
            >
              {t.signupPlans.changePlan}
            </button>
          ) : null}
          {!locked ? <p>{t.signupPlans.accountBody}</p> : null}
          {children}
        </div>
      ) : null}
      {choosing ? (
        <>
          <h2 ref={titleRef} tabIndex={-1}>
            {t.signupPlans.chooseTitle}
          </h2>
          <p>{t.signupPlans.chooseBody}</p>
          {status === 'error' ? (
            <div role="alert">
              <p>{t.signupPlans.unavailable}</p>
              <button
                type="button"
                className="cedros-button cedros-button-primary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                {t.common.retry}
              </button>
            </div>
          ) : (
            <>
              <div
                role="group"
                aria-label={t.signupPlans.billingPeriod}
                style={{ display: 'flex', gap: 12, marginBottom: 16 }}
              >
                {(['monthly', 'annual'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`cedros-button ${period === value ? 'cedros-button-primary' : 'cedros-button-social'}`}
                    aria-pressed={period === value}
                    onClick={() => setPeriod(value)}
                  >
                    {value === 'annual' ? t.signupPlans.annual : t.signupPlans.monthly}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {catalog?.[period].map((plan) => (
                  <button
                    key={plan.planId}
                    type="button"
                    className="cedros-button cedros-button-social"
                    style={{
                      display: 'grid',
                      textAlign: 'left',
                      justifyContent: 'stretch',
                      justifyItems: 'start',
                      height: 'auto',
                      whiteSpace: 'normal',
                      gap: 8,
                      padding: 16,
                    }}
                    onClick={() => choose(plan)}
                  >
                    <strong>{plan.displayName}</strong>
                    <span>{price(plan)}</span>
                    <span>{plan.description}</span>
                    <span>
                      {formatMessage(t.signupPlans.choosePlan, { plan: plan.displayName }, locale)}
                    </span>
                  </button>
                ))}
                {catalog && !catalog[period].length ? (
                  <p role="status">{t.signupPlans.emptyPeriod}</p>
                ) : null}
              </div>
            </>
          )}
          <p>
            {t.signupPlans.existingAccount}{' '}
            <button type="button" className="cedros-link" onClick={onSignIn}>
              {t.auth.tabs.signIn}
            </button>
          </p>
        </>
      ) : null}
    </div>
  );
}

function saveSelection(route: string, plan: SignupPlan, period: SignupBillingPeriod) {
  const page = new URL(window.location.href);
  page.searchParams.set('returnTo', signupPlanReturnTo(route, plan, period, page.href));
  window.history.replaceState(window.history.state, '', page);
}
