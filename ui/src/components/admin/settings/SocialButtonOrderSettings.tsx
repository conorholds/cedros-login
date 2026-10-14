/**
 * Drag-and-drop social button order settings with live preview.
 *
 * Uses a constrained Motion drag gesture with HTML5 and button fallbacks.
 * Reads enabled state from shared settings map (`auth_*_enabled` keys).
 */
import { useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { Reorder, useDragControls, useReducedMotion } from 'motion/react';
import { useI18n, type Translations } from '../../../i18n';
import { authProviderIcon } from '../../shared/providerIcons';
import { motionSprings } from '../../shared/motion';
import { useExternalEffect } from '../../../hooks/effects';
import { SortableMoveButtons } from './SortableMoveButtons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SocialButtonOrderSettingsProps {
  /** Settings map (key -> SystemSetting[]) from useSettingsAutosave */
  settings: Record<string, { key: string; value: string }[]>;
  /** Autosave handler from parent */
  handleChange: (key: string, value: string) => void;
}

interface ProviderMeta {
  icon: ReactNode;
  enabledKey: string;
}

const PROVIDERS: Record<string, ProviderMeta> = {
  webauthn: { icon: authProviderIcon('webauthn'), enabledKey: 'auth_webauthn_enabled' },
  google: { icon: authProviderIcon('google'), enabledKey: 'auth_google_enabled' },
  apple: { icon: authProviderIcon('apple'), enabledKey: 'auth_apple_enabled' },
  solana: { icon: authProviderIcon('solana'), enabledKey: 'auth_solana_enabled' },
};

const DEFAULT_ORDER = ['webauthn', 'google', 'apple', 'solana'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read whether a provider is enabled from the flattened settings. */
function isProviderEnabled(
  settings: Record<string, { key: string; value: string }[]>,
  enabledKey: string
): boolean {
  for (const group of Object.values(settings)) {
    const found = group.find((s) => s.key === enabledKey);
    if (found) return found.value === 'true';
  }
  return true; // default enabled when setting is absent
}

/** Read current order from settings map, falling back to default. */
function readOrder(settings: Record<string, { key: string; value: string }[]>): string[] {
  for (const group of Object.values(settings)) {
    const found = group.find((s) => s.key === 'ui_social_button_order');
    if (found && found.value) return found.value.split(',').map((s) => s.trim());
  }
  return DEFAULT_ORDER;
}

// ---------------------------------------------------------------------------
// Grab-handle icon
// ---------------------------------------------------------------------------

function GrabHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialButtonOrderSettings({
  settings,
  handleChange,
}: SocialButtonOrderSettingsProps) {
  const { t, message } = useI18n();
  const resolvedOrder = useMemo(() => readOrder(settings), [settings]);
  const [order, setOrder] = useState<string[]>(resolvedOrder);
  const orderRef = useRef(order);
  const isMotionDraggingRef = useRef(false);
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

  useExternalEffect(() => {
    if (isMotionDraggingRef.current) return;
    orderRef.current = resolvedOrder;
    setOrder(resolvedOrder);
  }, [resolvedOrder]);

  const persist = useCallback(
    (newOrder: string[]) => {
      orderRef.current = newOrder;
      setOrder(newOrder);
      handleChange('ui_social_button_order', newOrder.join(','));
    },
    [handleChange]
  );

  const previewOrder = useCallback((newOrder: string[]) => {
    orderRef.current = newOrder;
    setOrder(newOrder);
  }, []);

  const commitDraggedOrder = useCallback(
    (id: string) => {
      isMotionDraggingRef.current = false;
      const next = orderRef.current;
      handleChange('ui_social_button_order', next.join(','));
      const position = next.indexOf(id);
      if (position >= 0) {
        setAnnouncement(
          message(t.admin.settings.movedToPosition, {
            label: providerLabel(id, t),
            position: position + 1,
            count: next.length,
          })
        );
      }
    },
    [handleChange, message, t]
  );

  const onDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const onDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  }, []);

  const moveProvider = useCallback(
    (fromIdx: number, targetIdx: number) => {
      if (fromIdx === targetIdx || targetIdx < 0 || targetIdx >= order.length) return;
      const next = [...order];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(targetIdx, 0, moved);
      persist(next);
      setAnnouncement(
        message(t.admin.settings.movedToPosition, {
          label: providerLabel(moved, t),
          position: targetIdx + 1,
          count: next.length,
        })
      );
    },
    [message, order, persist, t]
  );

  const onDrop = useCallback(
    (targetIdx: number) => {
      const fromIdx = dragIdx.current;
      if (fromIdx !== null) moveProvider(fromIdx, targetIdx);
      dragIdx.current = null;
      setDragOverIdx(null);
    },
    [moveProvider]
  );

  const onDragEnd = useCallback(() => {
    dragIdx.current = null;
    setDragOverIdx(null);
  }, []);

  return (
    <div className="cedros-sortable-settings">
      <p className="cedros-settings-page-description">{t.admin.settings.socialOrderDescription}</p>
      <Reorder.Group
        as="ul"
        axis="y"
        values={order}
        onReorder={previewOrder}
        className="cedros-sortable-list cedros-social-order-list"
      >
        {order.map((id, index) => {
          const meta = PROVIDERS[id];
          if (!meta) return null;
          const enabled = isProviderEnabled(settings, meta.enabledKey);
          const label = providerLabel(id, t);
          return (
            <SocialReorderItem
              key={id}
              id={id}
              index={index}
              isDropTarget={dragOverIdx === index}
              onDragOver={(event) => onDragOver(event, index)}
              onDrop={() => onDrop(index)}
              onNativeDragStart={() => onDragStart(index)}
              onNativeDragEnd={onDragEnd}
              onMotionDragStart={() => {
                isMotionDraggingRef.current = true;
              }}
              onMotionDragEnd={() => commitDraggedOrder(id)}
            >
              <span className="cedros-social-order-item__icon">{meta.icon}</span>
              <span className="cedros-social-order-item__label">{label}</span>
              <span
                className={`cedros-data-pill ${enabled ? 'cedros-data-pill--success' : ''}`.trim()}
              >
                {enabled ? t.common.enabled : t.common.disabled}
              </span>
              <SortableMoveButtons
                label={label}
                canMoveUp={index > 0}
                canMoveDown={index < order.length - 1}
                onMoveUp={() => moveProvider(index, index - 1)}
                onMoveDown={() => moveProvider(index, index + 1)}
              />
            </SocialReorderItem>
          );
        })}
      </Reorder.Group>
      <p className="cedros-sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

interface SocialReorderItemProps {
  id: string;
  index: number;
  isDropTarget: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: () => void;
  onNativeDragStart: () => void;
  onNativeDragEnd: () => void;
  onMotionDragStart: () => void;
  onMotionDragEnd: () => void;
  children: ReactNode;
}

function SocialReorderItem({
  id,
  isDropTarget,
  onDragOver,
  onDrop,
  onNativeDragStart,
  onNativeDragEnd,
  onMotionDragStart,
  onMotionDragEnd,
  children,
}: SocialReorderItemProps) {
  const controls = useDragControls();
  const shouldReduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      as="li"
      value={id}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.08}
      dragMomentum={false}
      layout="position"
      transition={{ layout: motionSprings.settle }}
      whileDrag={shouldReduceMotion ? undefined : { scale: 1.015 }}
      className="cedros-data-card cedros-sortable-item cedros-social-order-item"
      data-drop-target={isDropTarget ? 'true' : undefined}
      data-dragging={isDragging ? 'true' : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragStart={(_event, info) => {
        if (!info) return;
        setIsDragging(true);
        onMotionDragStart();
      }}
      onDragEnd={(_event, info) => {
        if (!info) return;
        setIsDragging(false);
        onMotionDragEnd();
      }}
    >
      <span
        className="cedros-sortable-handle"
        draggable
        aria-hidden="true"
        onPointerDown={(event) => controls.start(event)}
        onDragStart={onNativeDragStart}
        onDragEnd={onNativeDragEnd}
      >
        <GrabHandle />
      </span>
      {children}
    </Reorder.Item>
  );
}

function providerLabel(id: string, t: Translations): string {
  switch (id) {
    case 'webauthn':
      return t.auth.providers.passkey;
    case 'google':
      return t.auth.providers.google;
    case 'apple':
      return t.auth.providers.apple;
    case 'solana':
      return t.auth.providers.solana;
    default:
      return id;
  }
}
