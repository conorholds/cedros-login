import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollapsibleBody, DirectionalPanel } from './MotionPrimitives';

beforeEach(() => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList
  );
});

describe('DirectionalPanel', () => {
  it('replaces the outgoing step and focuses the incoming panel', async () => {
    const { rerender } = render(
      <DirectionalPanel stateKey="credentials" order={['credentials', 'verify']} focusOnChange>
        <span>Credentials</span>
      </DirectionalPanel>
    );

    rerender(
      <DirectionalPanel stateKey="verify" order={['credentials', 'verify']} focusOnChange>
        <span>Verify account</span>
      </DirectionalPanel>
    );

    await screen.findByText('Verify account');
    await waitFor(() => expect(screen.queryByText('Credentials')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(screen.getByText('Verify account').parentElement);
  });
});

describe('CollapsibleBody', () => {
  it('does not expose closed controls and removes them after exit', async () => {
    const { rerender } = render(
      <CollapsibleBody open={false}>
        <button type="button">Advanced control</button>
      </CollapsibleBody>
    );

    expect(screen.queryByRole('button', { name: 'Advanced control' })).not.toBeInTheDocument();

    rerender(
      <CollapsibleBody open>
        <button type="button">Advanced control</button>
      </CollapsibleBody>
    );
    expect(screen.getByRole('button', { name: 'Advanced control' })).toBeInTheDocument();

    rerender(
      <CollapsibleBody open={false}>
        <button type="button">Advanced control</button>
      </CollapsibleBody>
    );
    expect(screen.queryByRole('button', { name: 'Advanced control' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Advanced control')).not.toBeInTheDocument());
  });
});

it('makes an outgoing authentication step inert immediately, before its animation finishes', () => {
  const { rerender } = render(
    <DirectionalPanel stateKey="login" order={['login', 'register']}>
      <button>Old sign-in</button>
    </DirectionalPanel>
  );
  const oldControl = screen.getByRole('button', { name: 'Old sign-in' });
  rerender(
    <DirectionalPanel stateKey="register" order={['login', 'register']}>
      <button>New registration</button>
    </DirectionalPanel>
  );
  expect(oldControl.closest('[inert]')).not.toBeNull();
  expect(screen.queryByRole('button', { name: 'Old sign-in' })).not.toBeInTheDocument();
});
