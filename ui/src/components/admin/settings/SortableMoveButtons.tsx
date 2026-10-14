interface SortableMoveButtonsProps {
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SortableMoveButtons({
  label,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: SortableMoveButtonsProps) {
  const { t, message } = useI18n();
  const upLabel = message(t.admin.settings.moveItemUp, { label });
  const downLabel = message(t.admin.settings.moveItemDown, { label });
  return (
    <div className="cedros-data-row-actions cedros-sortable-actions">
      <button
        type="button"
        className="cedros-data-row-actions__icon"
        aria-label={upLabel}
        title={upLabel}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        <UpIcon />
      </button>
      <button
        type="button"
        className="cedros-data-row-actions__icon"
        aria-label={downLabel}
        title={downLabel}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <DownIcon />
      </button>
    </div>
  );
}

function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
import { useI18n } from '../../../i18n';
