import type { CedrosAutosaveConflict } from './types';

export interface AutosaveConflictDialogProps {
  conflict: CedrosAutosaveConflict | null;
  onReview: () => void;
  onDiscard: () => void;
}

export function AutosaveConflictDialog({
  conflict,
  onReview,
  onDiscard,
}: AutosaveConflictDialogProps) {
  if (!conflict) return null;

  return (
    <div
      className="cedros-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cedros-autosave-conflict-title"
    >
      <div className="cedros-confirm-dialog">
        <h2 id="cedros-autosave-conflict-title" className="cedros-confirm-dialog__title">
          Conflict - review changes
        </h2>
        <p className="cedros-confirm-dialog__description">{conflict.message}</p>
        <div className="cedros-confirm-dialog__actions">
          <button
            type="button"
            className="cedros-button cedros-button-secondary"
            onClick={onDiscard}
          >
            Discard local changes
          </button>
          <button type="button" className="cedros-button cedros-button-primary" onClick={onReview}>
            Review changes
          </button>
        </div>
      </div>
    </div>
  );
}
