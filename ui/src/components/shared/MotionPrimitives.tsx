import { useRef, useState, type Key, type ReactNode } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react';
import { useExternalEffect } from '../../hooks/effects';
import { motionSprings } from './motion';

interface DirectionalPanelProps {
  stateKey: Key;
  order: readonly Key[];
  children: ReactNode;
  className?: string;
  focusOnChange?: boolean;
}

/**
 * Spatially connects sequential states while keeping interrupted transitions
 * on the same spring. MotionConfig applies the user's reduced-motion setting.
 */
export function DirectionalPanel({
  stateKey,
  order,
  children,
  className = '',
  focusOnChange = false,
}: DirectionalPanelProps) {
  const [transitionState, setTransitionState] = useState({ current: stateKey, previous: stateKey });
  if (transitionState.current !== stateKey) {
    setTransitionState({ current: stateKey, previous: transitionState.current });
  }
  const shouldReduceMotion = useReducedMotion();
  const previousIndex = order.indexOf(transitionState.previous);
  const currentIndex = order.indexOf(stateKey);
  const direction = currentIndex === previousIndex ? 1 : currentIndex > previousIndex ? 1 : -1;
  const focusOnMount = focusOnChange && transitionState.previous !== stateKey;

  const distance = shouldReduceMotion ? 0 : 18;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <DirectionalPresence
          key={stateKey}
          className={`cedros-directional-panel ${className}`.trim()}
          direction={direction}
          distance={distance}
          focusOnMount={focusOnMount}
          reduceMotion={shouldReduceMotion}
        >
          {children}
        </DirectionalPresence>
      </AnimatePresence>
    </MotionConfig>
  );
}

function DirectionalPresence({
  children,
  className,
  direction,
  distance,
  focusOnMount,
  reduceMotion,
}: {
  children: ReactNode;
  className: string;
  direction: number;
  distance: number;
  focusOnMount: boolean;
  reduceMotion: boolean | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();

  useExternalEffect(() => {
    if (focusOnMount) panelRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <motion.div
      ref={panelRef}
      inert={!isPresent ? true : undefined}
      aria-hidden={!isPresent ? true : undefined}
      className={className}
      tabIndex={focusOnMount ? -1 : undefined}
      custom={direction}
      initial={{ opacity: 0, x: direction * distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -distance }}
      transition={{
        x: motionSprings.responsive,
        opacity: { duration: reduceMotion ? 0.001 : 0.14 },
      }}
    >
      {children}
    </motion.div>
  );
}

interface CollapsibleBodyProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/** Keeps content present long enough to animate, but inert while collapsed. */
export function CollapsibleBody({ open, children, className = '' }: CollapsibleBodyProps) {
  return (
    <AnimatePresence initial={false}>
      {open && <CollapsiblePresence className={className}>{children}</CollapsiblePresence>}
    </AnimatePresence>
  );
}

function CollapsiblePresence({ children, className }: { children: ReactNode; className: string }) {
  const isPresent = useIsPresent();
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0.001 : 0.24;

  return (
    <motion.div
      className={`cedros-collapsible ${className}`.trim()}
      initial={{ gridTemplateRows: '0fr', opacity: 0 }}
      animate={{ gridTemplateRows: '1fr', opacity: 1 }}
      exit={{ gridTemplateRows: '0fr', opacity: 0 }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={!isPresent}
    >
      <div className="cedros-collapsible__inner" inert={!isPresent ? true : undefined}>
        {children}
      </div>
    </motion.div>
  );
}
