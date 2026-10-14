import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SystemSetting } from '../../types';
import { SystemSettings } from './SystemSettings';

const state = vi.hoisted(() => ({ settings: {} as Record<string, SystemSetting[]> }));
vi.mock('../../hooks/useSettingsAutosave', () => ({
  useSettingsAutosave: () => ({
    ...state,
    edits: {},
    isLoading: false,
    autosaveStatus: 'idle',
    autosaveError: null,
    error: null,
    fetchSettings: vi.fn(),
    handleChange: vi.fn(),
    confirmManualSetting: vi.fn(),
    discardManualSetting: vi.fn(),
    isManualSettingSaving: () => false,
    getManualSettingError: () => null,
  }),
}));
function setting(key: string, value: string): SystemSetting {
  return { key, value, description: null, isSecret: false, updatedAt: '', updatedBy: null };
}

describe('SystemSettings Pay ownership', () => {
  it('omits retired Pay fields even when an older server returns them', () => {
    state.settings = {
      'postlogin.subscription': [
        setting('subscription_selection_pay_base_url', 'https://saved-pay.example.test'),
        setting('team_plan_seat_limits', '{"team":5}'),
        setting('subscription_selection_route', '/pricing'),
      ],
    };
    render(<SystemSettings />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByDisplayValue('/pricing')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('https://saved-pay.example.test')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('{"team":5}')).not.toBeInTheDocument();
  });
  it('omits categories containing only retired Pay fields', () => {
    state.settings = { 'postlogin.subscription': [setting('team_plan_seat_limits', '{"team":5}')] };
    const { container } = render(<SystemSettings />);
    expect(container.querySelector('.cedros-settings-section')).toBeNull();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
