import type { CedrosAutosaveStatus } from './types';

export interface AutosaveStatusLabels {
  dirty: string;
  debouncing: string;
  queued: string;
  saving: string;
  saved: string;
  retrying: string;
  offline: string;
  conflict: string;
  failed: string;
}

export interface AutosaveStatusIndicatorProps {
  status: CedrosAutosaveStatus;
  error?: string | null;
  labels?: Partial<AutosaveStatusLabels>;
}

const DEFAULT_LABELS: AutosaveStatusLabels = {
  dirty: 'Unsaved changes',
  debouncing: 'Unsaved changes',
  queued: 'Unsaved changes',
  saving: 'Saving...',
  saved: 'Saved just now',
  retrying: 'Saving...',
  offline: 'Offline - changes will sync',
  conflict: 'Conflict - review changes',
  failed: 'Save failed - retry',
};

export function AutosaveStatusIndicator({ status, error, labels }: AutosaveStatusIndicatorProps) {
  if (status === 'idle') return null;

  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const visibleStatus = status as Exclude<CedrosAutosaveStatus, 'idle'>;
  const label = visibleStatus === 'failed' && error ? error : mergedLabels[visibleStatus];

  return (
    <div
      className={`cedros-autosave-status cedros-autosave-status--${status}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <AutosaveStatusIcon status={status} />
      <span>{label}</span>
    </div>
  );
}

function AutosaveStatusIcon({ status }: { status: CedrosAutosaveStatus }) {
  if (status === 'saving' || status === 'retrying') {
    return <span className="cedros-autosave-spinner" aria-hidden="true" />;
  }
  if (status === 'saved') {
    return (
      <span className="cedros-autosave-check" aria-hidden="true">
        &#10003;
      </span>
    );
  }
  if (status === 'failed' || status === 'conflict') {
    return (
      <span className="cedros-autosave-error-icon" aria-hidden="true">
        !
      </span>
    );
  }
  return <span className="cedros-autosave-dot" aria-hidden="true" />;
}
