import { useCallback, useState } from 'react';
import {
  useCedrosLoginAdminRuntimeOptional,
  type CedrosLoginEarlyAccessState,
} from '../../../admin/CedrosLoginAdminRuntimeContext';
import { useExternalEffect } from '../../../hooks/effects';
import { useTranslations } from '../../../i18n';
import { ErrorMessage } from '../../shared/ErrorMessage';

export interface EarlyAccessSettingsProps {
  onInviteCodePolicyChanged: () => Promise<void>;
}

export function EarlyAccessSettings({ onInviteCodePolicyChanged }: EarlyAccessSettingsProps) {
  const t = useTranslations();
  const earlyAccessHost = useCedrosLoginAdminRuntimeOptional()?.earlyAccessHost;
  const [state, setState] = useState<CedrosLoginEarlyAccessState | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(earlyAccessHost));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!earlyAccessHost) return;
    setIsLoading(true);
    setError(null);
    try {
      setState(await earlyAccessHost.getState());
    } catch (err) {
      setError(messageFromError(err, 'Unable to load early-access mode.'));
    } finally {
      setIsLoading(false);
    }
  }, [earlyAccessHost]);

  useExternalEffect(() => {
    void load();
  }, [load]);

  const setEnabled = useCallback(async () => {
    if (!earlyAccessHost || !state) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await earlyAccessHost.setEnabled(!state.enabled);
      setState(updated);
      if (updated.enabled) await onInviteCodePolicyChanged();
    } catch (err) {
      setError(messageFromError(err, 'Unable to update early-access mode.'));
    } finally {
      setIsSaving(false);
    }
  }, [earlyAccessHost, onInviteCodePolicyChanged, state]);

  const available = Boolean(earlyAccessHost && state?.available);
  const enabled = state?.enabled === true;
  // With no host there is nothing to wait for — unavailable is already the final answer.
  const stateKnown = !earlyAccessHost || state !== null;
  const disabled =
    !available ||
    state?.editable !== true ||
    state?.waitlistModeEnabled !== true ||
    isLoading ||
    isSaving;

  return (
    <div
      className={`cedros-data-card cedros-auth-method-card ${enabled ? 'cedros-auth-method-card--enabled' : ''}`}
    >
      <div className="cedros-data-card__header cedros-auth-method-card-header">
        <div className="cedros-auth-method-card-info">
          <div className="cedros-auth-method-card-title-row">
            <span className="cedros-data-card__title cedros-auth-method-card-name">
              Early access mode
            </span>
            <span
              className={`cedros-data-pill cedros-auth-method-badge ${enabled ? 'cedros-data-pill--success cedros-auth-method-badge--on' : ''}`}
            >
              {enabled ? t.common.enabled : t.common.disabled}
            </span>
          </div>
          <p className="cedros-auth-method-card-description">
            {earlyAccessDescription({
              loaded: stateKnown,
              available,
              editable: state?.editable,
              waitlistModeEnabled: state?.waitlistModeEnabled,
            })}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Early access mode"
          aria-busy={isLoading || isSaving}
          className={`cedros-toggle ${enabled ? 'cedros-toggle-on' : 'cedros-toggle-off'}`}
          onClick={() => void setEnabled()}
          disabled={disabled}
        >
          <span className="cedros-toggle-track">
            <span className="cedros-toggle-thumb" />
          </span>
        </button>
      </div>
      {error && (
        <div className="cedros-data-card__body cedros-auth-method-card-body">
          <ErrorMessage error={error} onDismiss={() => setError(null)} />
        </div>
      )}
    </div>
  );
}

const EARLY_ACCESS_DESCRIPTION =
  'Let invited members sign up, sign in, and view a site that is still in Waitlist mode. Enabling this also turns on Require invite codes; disabling it leaves the invite-code policy unchanged.';

/**
 * Until the host state lands, render what the setting does rather than a
 * gating reason we have not confirmed yet — asserting "unavailable" during the
 * load swaps one line of copy for three the moment the state resolves, and the
 * card visibly grows under the pointer.
 */
function earlyAccessDescription({
  loaded,
  available,
  editable,
  waitlistModeEnabled,
}: {
  loaded: boolean;
  available: boolean;
  editable?: boolean;
  waitlistModeEnabled?: boolean;
}): string {
  if (!loaded) return EARLY_ACCESS_DESCRIPTION;
  if (!available) return 'Available when the Cedros Data host provides waitlist controls.';
  if (!editable) return 'You need permission to update Site settings.';
  if (!waitlistModeEnabled) return 'Switch the site to Waitlist mode before enabling early access.';
  return EARLY_ACCESS_DESCRIPTION;
}

function messageFromError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
