import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Reorder, useDragControls, useReducedMotion } from 'motion/react';
import { useI18n, type Translations } from '../../../i18n';
import type { SystemSetting } from '../../../types';
import { AuthMethodCard } from './AuthMethodCard';
import { SortableMoveButtons } from './SortableMoveButtons';
import { SubscriptionSelectionSettings } from './SubscriptionSelectionSettings';
import { useExternalEffect } from '../../../hooks/effects';
import { motionSprings } from '../../shared/motion';

const FLOW_ORDER_KEY = 'postlogin_flow_order';
const DEFAULT_FLOW_ORDER = ['subscription', 'username', 'welcome', 'profile'] as const;

type PostLoginStepId = (typeof DEFAULT_FLOW_ORDER)[number];

interface PostLoginFlowOrderSettingsProps {
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  cedrosPayInstalled?: boolean;
}

export function PostLoginFlowOrderSettings({
  byKey,
  edits,
  onChange,
  cedrosPayInstalled,
}: PostLoginFlowOrderSettingsProps) {
  const { t, message } = useI18n();
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const resolvedOrder = useMemo(() => readFlowOrder(byKey, edits), [byKey, edits]);
  const [order, setOrder] = useState<PostLoginStepId[]>(resolvedOrder);
  const orderRef = useRef(order);
  const isMotionDraggingRef = useRef(false);

  useExternalEffect(() => {
    if (isMotionDraggingRef.current) return;
    orderRef.current = resolvedOrder;
    setOrder(resolvedOrder);
  }, [resolvedOrder]);

  const persistOrder = useCallback(
    (nextOrder: PostLoginStepId[]) => {
      orderRef.current = nextOrder;
      setOrder(nextOrder);
      onChange(FLOW_ORDER_KEY, nextOrder.join(','));
    },
    [onChange]
  );

  const previewOrder = useCallback((nextOrder: PostLoginStepId[]) => {
    orderRef.current = nextOrder;
    setOrder(nextOrder);
  }, []);

  const commitDraggedOrder = useCallback(
    (step: PostLoginStepId) => {
      isMotionDraggingRef.current = false;
      const next = orderRef.current;
      onChange(FLOW_ORDER_KEY, next.join(','));
      const position = next.indexOf(step);
      if (position >= 0) {
        setAnnouncement(
          message(t.admin.settings.movedToPosition, {
            label: stepLabel(step, t),
            position: position + 1,
            count: next.length,
          })
        );
      }
    },
    [message, onChange, t]
  );

  const moveStep = useCallback(
    (fromIdx: number, targetIdx: number) => {
      if (fromIdx === targetIdx || targetIdx < 0 || targetIdx >= order.length) return;
      const next = [...order];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(targetIdx, 0, moved);
      persistOrder(next);
      setAnnouncement(
        message(t.admin.settings.movedToPosition, {
          label: stepLabel(moved, t),
          position: targetIdx + 1,
          count: next.length,
        })
      );
    },
    [message, order, persistOrder, t]
  );

  const onDrop = useCallback(
    (targetIdx: number) => {
      const fromIdx = dragIdx.current;
      if (fromIdx !== null) moveStep(fromIdx, targetIdx);
      dragIdx.current = null;
      setDragOverIdx(null);
    },
    [moveStep]
  );

  const onDragEnd = useCallback(() => {
    dragIdx.current = null;
    setDragOverIdx(null);
  }, []);

  return (
    <div className="cedros-sortable-settings">
      <Reorder.Group
        as="div"
        axis="y"
        values={order}
        onReorder={previewOrder}
        role="list"
        aria-label={t.admin.settings.postLoginFlowOrder}
        className="cedros-sortable-list"
      >
        {order.map((step, index) => (
          <FlowReorderItem
            key={step}
            step={step}
            label={message(t.admin.settings.postLoginFlowStep, { label: stepLabel(step, t) })}
            isDropTarget={dragOverIdx === index}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverIdx(index);
            }}
            onDrop={() => onDrop(index)}
            onNativeDragStart={() => {
              dragIdx.current = index;
            }}
            onNativeDragEnd={onDragEnd}
            onMotionDragStart={() => {
              isMotionDraggingRef.current = true;
            }}
            onMotionDragEnd={() => commitDraggedOrder(step)}
          >
            <div className="cedros-sortable-item__content">
              {renderStep(step, byKey, edits, onChange, cedrosPayInstalled)}
            </div>
            <SortableMoveButtons
              label={stepLabel(step, t)}
              canMoveUp={index > 0}
              canMoveDown={index < order.length - 1}
              onMoveUp={() => moveStep(index, index - 1)}
              onMoveDown={() => moveStep(index, index + 1)}
            />
          </FlowReorderItem>
        ))}
      </Reorder.Group>
      <p className="cedros-sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

interface FlowReorderItemProps {
  step: PostLoginStepId;
  label: string;
  isDropTarget: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: () => void;
  onNativeDragStart: () => void;
  onNativeDragEnd: () => void;
  onMotionDragStart: () => void;
  onMotionDragEnd: () => void;
  children: ReactNode;
}

function FlowReorderItem({
  step,
  label,
  isDropTarget,
  onDragOver,
  onDrop,
  onNativeDragStart,
  onNativeDragEnd,
  onMotionDragStart,
  onMotionDragEnd,
  children,
}: FlowReorderItemProps) {
  const controls = useDragControls();
  const shouldReduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={step}
      role="listitem"
      aria-label={label}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.08}
      dragMomentum={false}
      layout="position"
      transition={{ layout: motionSprings.settle }}
      whileDrag={shouldReduceMotion ? undefined : { scale: 1.01 }}
      className="cedros-sortable-item"
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

function readFlowOrder(
  byKey: Record<string, SystemSetting>,
  edits: Record<string, string>
): PostLoginStepId[] {
  const value = edits[FLOW_ORDER_KEY] ?? byKey[FLOW_ORDER_KEY]?.value;
  if (!value) return DEFAULT_FLOW_ORDER.filter((step) => isStepAvailable(step, byKey));

  const steps = value
    .split(',')
    .map((step) => step.trim())
    .filter(isPostLoginStepId);
  const unique = steps.filter((step, index) => steps.indexOf(step) === index);
  const missing = DEFAULT_FLOW_ORDER.filter((step) => !unique.includes(step));
  return [...unique, ...missing].filter((step) => isStepAvailable(step, byKey));
}

function isPostLoginStepId(step: string): step is PostLoginStepId {
  return DEFAULT_FLOW_ORDER.includes(step as PostLoginStepId);
}

function stepLabel(step: PostLoginStepId, t: Translations): string {
  switch (step) {
    case 'subscription':
      return t.admin.settings.subscriptionSelection;
    case 'username':
      return t.admin.settings.usernameSelection;
    case 'welcome':
      return t.admin.settings.welcomePage;
    case 'profile':
      return t.admin.settings.profileCompletion;
  }
}

function isStepAvailable(step: PostLoginStepId, byKey: Record<string, SystemSetting>): boolean {
  switch (step) {
    case 'subscription':
      return Boolean(byKey.subscription_selection_required);
    case 'username':
      return Boolean(byKey.postlogin_username_enabled);
    case 'welcome':
      return Boolean(byKey.postlogin_welcome_enabled);
    case 'profile':
      return Boolean(byKey.postlogin_complete_enabled);
  }
}

function renderStep(
  step: PostLoginStepId,
  byKey: Record<string, SystemSetting>,
  edits: Record<string, string>,
  onChange: (key: string, value: string) => void,
  cedrosPayInstalled?: boolean
) {
  switch (step) {
    case 'subscription':
      return (
        <SubscriptionSelectionSettings
          byKey={byKey}
          edits={edits}
          onChange={onChange}
          cedrosPayInstalled={cedrosPayInstalled}
        />
      );
    case 'username':
      return (
        <AuthMethodCard
          enabledKey="postlogin_username_enabled"
          byKey={byKey}
          edits={edits}
          onChange={onChange}
        />
      );
    case 'welcome':
      return (
        <AuthMethodCard
          enabledKey="postlogin_welcome_enabled"
          configKeys={['postlogin_welcome_route']}
          byKey={byKey}
          edits={edits}
          onChange={onChange}
        />
      );
    case 'profile':
      return (
        <AuthMethodCard
          enabledKey="postlogin_complete_enabled"
          byKey={byKey}
          edits={edits}
          onChange={onChange}
        />
      );
  }
}

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
