import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminActionMenu } from './AdminActionMenu';

const items = [
  { label: 'Edit', onSelect: vi.fn() },
  { label: 'Duplicate', onSelect: vi.fn() },
  { label: 'Delete', onSelect: vi.fn() },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AdminActionMenu', () => {
  it('supports buffered typeahead across menu items', () => {
    render(<AdminActionMenu label="Row actions" items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'd' });
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'e' });
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('opens above the trigger when the lower viewport has insufficient room', () => {
    vi.stubGlobal('innerHeight', 400);
    vi.stubGlobal('innerWidth', 1000);
    render(<AdminActionMenu label="Row actions" items={items} />);
    const trigger = screen.getByRole('button', { name: 'Row actions' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 700,
      top: 350,
      bottom: 382,
      right: 900,
    } as DOMRect);

    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toHaveAttribute('data-side', 'top');
    expect(screen.getByRole('menu')).toHaveStyle({ bottom: '50px', right: '100px' });
  });

  it('aligns to the left edge of a trigger near the viewport boundary', () => {
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 1000);
    render(<AdminActionMenu label="Row actions" items={items} />);
    const trigger = screen.getByRole('button', { name: 'Row actions' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 12,
      top: 20,
      bottom: 52,
      right: 44,
    } as DOMRect);

    fireEvent.click(trigger);

    expect(screen.getByRole('menu')).toHaveStyle({ left: '12px', top: '52px' });
  });
});
