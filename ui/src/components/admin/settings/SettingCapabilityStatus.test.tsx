import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SystemSetting } from '../../../types';
import { SettingCapabilityStatus } from './SettingCapabilityStatus';

function setting(overrides: Partial<SystemSetting>): SystemSetting {
  return {
    key: 'signup_limit_period',
    value: 'daily',
    category: 'auth.signup_limits',
    applicationMode: 'hot',
    ...overrides,
  } as SystemSetting;
}

describe('SettingCapabilityStatus', () => {
  it('stays silent for settings that apply immediately', () => {
    const { container } = render(<SettingCapabilityStatus setting={setting({})} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('still surfaces restart requirements and validation errors', () => {
    render(
      <SettingCapabilityStatus
        setting={setting({ applicationMode: 'restart', validationError: 'Value must be a host.' })}
      />
    );
    expect(screen.getByText(/restart/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Value must be a host.');
  });
});
