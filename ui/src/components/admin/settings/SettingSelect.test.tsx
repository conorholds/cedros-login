import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SettingSelect } from './SettingSelect';

const OPTIONS = [
  { label: '5 minutes', value: '300' },
  { label: '15 minutes', value: '900' },
  { label: '1 hour', value: '3600' },
];

describe('SettingSelect', () => {
  it('renders the selected option through the host native-select contract', () => {
    render(
      <SettingSelect
        value="900"
        options={OPTIONS}
        onChange={() => {}}
        ariaLabel="Session duration"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Session duration' });
    expect(select).toHaveClass('cedros-data-select', 'cedros-setting-select');
    expect(select).toHaveValue('900');
  });

  it('passes the newly selected value to the existing change handler', () => {
    const onChange = vi.fn();
    render(
      <SettingSelect
        value="900"
        options={OPTIONS}
        onChange={onChange}
        ariaLabel="Session duration"
      />
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'Session duration' }), {
      target: { value: '3600' },
    });

    expect(onChange).toHaveBeenCalledWith('3600');
  });

  it('shows a disabled placeholder when the current value is not an option', () => {
    render(
      <SettingSelect
        value="2700"
        options={OPTIONS}
        onChange={() => {}}
        ariaLabel="Session duration"
        placeholder="Custom…"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Session duration' });
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Custom…' })).toBeDisabled();
  });
});
