import { useRef, type CSSProperties } from 'react';
import { useExternalEffect } from '../../hooks/effects';
import { useI18n } from '../../i18n';
import type { InviteDiscount } from '../../types';

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#38bdf8', '#34d399', '#a78bfa'];

/** Deterministic burst layout: evenly spread spokes with varied radius/spin/delay. */
const CONFETTI_PIECES = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  const radius = 84 + (index % 3) * 24;
  const rotation = 140 + (index % 5) * 70;
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius * 0.85) - 20,
    midX: Math.round(Math.cos(angle) * radius * 0.62),
    midY: Math.round((Math.sin(angle) * radius * 0.85 - 20) * 0.62),
    rotation,
    midRotation: Math.round(rotation * 0.58),
    stretch: Number((1.12 + radius / 500).toFixed(2)),
    blur: Number((0.55 + radius / 180).toFixed(2)),
    delay: 140 + (index % 4) * 90,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    round: index % 3 === 0,
  };
});

export interface InviteUnlockCelebrationProps {
  /** Discount granted by the redeemed code; revealed as the reward moment. */
  discount?: InviteDiscount | null;
  onContinue: () => void;
  className?: string;
}

/**
 * Full-card success moment shown after an invite code is accepted: an animated
 * unlock seal with a confetti burst, staggered copy, and (when the code carries
 * one) the granted subscription discount. The parent handles continuing.
 * All motion collapses under the global `prefers-reduced-motion` guard in login.css.
 */
export function InviteUnlockCelebration({
  discount,
  onContinue,
  className = '',
}: InviteUnlockCelebrationProps) {
  const { t, message } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useExternalEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const rewardLabel = !discount
    ? null
    : discount.percentOff >= 100
      ? t.auth.inviteUnlockRewardFree
      : message(t.auth.inviteUnlockRewardPercent, { percent: discount.percentOff });

  return (
    <div className={`cedros-form cedros-invite-unlock ${className}`} role="status">
      <div className="cedros-invite-unlock__stage" aria-hidden="true">
        <span className="cedros-invite-unlock__halo" />
        <span className="cedros-invite-unlock__ring" />
        {CONFETTI_PIECES.map((piece, index) => (
          <span
            key={index}
            className={`cedros-invite-unlock__confetti${
              piece.round ? ' cedros-invite-unlock__confetti--round' : ''
            }`}
            style={
              {
                '--unlock-x': `${piece.x}px`,
                '--unlock-y': `${piece.y}px`,
                '--unlock-mid-x': `${piece.midX}px`,
                '--unlock-mid-y': `${piece.midY}px`,
                '--unlock-rotation': `${piece.rotation}deg`,
                '--unlock-mid-rotation': `${piece.midRotation}deg`,
                '--unlock-stretch': piece.stretch,
                '--unlock-blur': `${piece.blur}px`,
                '--unlock-delay': `${piece.delay}ms`,
                '--unlock-color': piece.color,
              } as CSSProperties
            }
          />
        ))}
        <span className="cedros-invite-unlock__seal">
          <svg className="cedros-invite-unlock__check" viewBox="0 0 52 52" aria-hidden="true">
            <path d="M14 27.5 22.5 36 38 17" />
          </svg>
        </span>
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="cedros-form-title cedros-invite-unlock__title">
        {t.auth.inviteUnlockTitle}
      </h2>
      <p className="cedros-form-subtitle cedros-invite-unlock__subtitle">
        {t.auth.inviteUnlockBody}
      </p>

      {rewardLabel && (
        <div className="cedros-invite-unlock__reward">
          <span className="cedros-invite-unlock__reward-badge">
            <GiftIcon />
            {rewardLabel}
          </span>
          <span className="cedros-invite-unlock__reward-note">
            {discount?.durationMonths != null
              ? message(
                  discount.durationMonths === 1
                    ? t.auth.inviteUnlockRewardMonth
                    : t.auth.inviteUnlockRewardMonths,
                  { months: discount.durationMonths }
                )
              : t.auth.inviteUnlockRewardNote}
          </span>
        </div>
      )}

      <button
        type="button"
        className="cedros-button cedros-button-primary cedros-button-md cedros-button-full cedros-invite-unlock__continue"
        onClick={onContinue}
      >
        {t.auth.inviteUnlockContinue}
      </button>
    </div>
  );
}

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
