import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InviteUnlockCelebration } from './InviteUnlockCelebration';

describe('invite discount duration copy', () => {
  it.each([50, 100])('shows a fixed term for a %s percent discount', (percentOff) => {
    render(
      <InviteUnlockCelebration
        discount={{ percentOff, code: 'WELCOME', durationMonths: 3 }}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/first 3 months/)).toBeInTheDocument();
    expect(screen.queryByText(/life of your subscription/)).not.toBeInTheDocument();
    expect(screen.getByText(/Standard pricing resumes afterward/)).toBeInTheDocument();
  });

  it('uses singular copy for one month', () => {
    render(
      <InviteUnlockCelebration
        discount={{ percentOff: 100, code: 'WELCOME', durationMonths: 1 }}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/first month/)).toBeInTheDocument();
  });

  it.each([null, undefined])('preserves legacy lifetime copy for %s', (durationMonths) => {
    render(
      <InviteUnlockCelebration
        discount={{ percentOff: 50, code: 'WELCOME', durationMonths }}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/life of your subscription/)).toBeInTheDocument();
  });
});
