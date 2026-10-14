import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SettingMeta, SystemSetting } from '../../../types';
import { SettingsSection } from './settingsInputs';

describe('SettingsSection manual-only secret controls', () => {
  it('renders field-level confirmation for changed secrets without save or reset controls', () => {
    const onConfirm = vi.fn(async () => undefined);
    const onCancel = vi.fn();

    render(
      <SettingsSection
        settings={[setting('server_metrics_api_key', 'old-secret', true)]}
        edits={{ server_metrics_api_key: 'new-secret' }}
        onChange={vi.fn()}
        metadata={metadata()}
        manualCommit={{
          onConfirm,
          onCancel,
          isSaving: () => false,
          getError: () => null,
        }}
      />
    );

    expect(screen.getByText('Secret changes require confirmation.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm secret update' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).toHaveBeenCalledWith('server_metrics_api_key');
    expect(onCancel).toHaveBeenCalledWith('server_metrics_api_key');
  });

  it('does not render manual confirmation for autosaved non-secret changes', () => {
    render(
      <SettingsSection
        settings={[setting('server_log_level', 'info')]}
        edits={{ server_log_level: 'warn' }}
        onChange={vi.fn()}
        metadata={metadata()}
        manualCommit={{
          onConfirm: vi.fn(async () => undefined),
          onCancel: vi.fn(),
          isSaving: () => false,
          getError: () => null,
        }}
      />
    );

    expect(screen.queryByText('Secret changes require confirmation.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm secret update' })).not.toBeInTheDocument();
  });

  it('shows configured secret state without requiring a secret value in the response', () => {
    render(
      <SettingsSection
        settings={[{ ...setting('server_metrics_api_key', '', true), hasValue: true }]}
        edits={{}}
        onChange={vi.fn()}
        metadata={metadata()}
      />
    );

    expect(screen.getByText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('shows application timing and legacy validation diagnostics', () => {
    render(
      <SettingsSection
        settings={[
          {
            ...setting('server_log_level', 'invalid-format'),
            applicationMode: 'restart',
            validationError: 'Value must be one of: text, json.',
          } as SystemSetting,
        ]}
        edits={{}}
        onChange={vi.fn()}
        metadata={metadata()}
      />
    );

    expect(screen.getByText(/restart/i)).toBeInTheDocument();
    expect(screen.getByText('Value must be one of: text, json.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('invalid-format')).toHaveAttribute('aria-invalid', 'true');
  });

  it('prevents edits for host-owned and unsupported settings', () => {
    const onChange = vi.fn();
    render(
      <SettingsSection
        settings={[
          {
            ...setting('server_log_level', 'json'),
            applicationMode: 'host-owned',
            validationError: null,
          } as SystemSetting,
        ]}
        edits={{}}
        onChange={onChange}
        metadata={metadata()}
      />
    );

    const input = screen.getByDisplayValue('json');
    expect(input).toBeDisabled();
    expect(screen.getByText(/managed by.*host/i)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'text' } });
    expect(onChange).not.toHaveBeenCalled();
  });
});

function metadata(): Record<string, SettingMeta> {
  return {
    server_metrics_api_key: {
      key: 'server_metrics_api_key',
      label: 'Metrics API key',
      description: 'Secret token for metrics.',
      inputType: 'secret',
    },
    server_log_level: {
      key: 'server_log_level',
      label: 'Log level',
      description: 'Server log level.',
      inputType: 'text',
    },
  };
}

function setting(key: string, value: string, isSecret = false): SystemSetting {
  return {
    key,
    value,
    isSecret,
    description: null,
    updatedAt: '2026-07-02T00:00:00.000Z',
    updatedBy: null,
  };
}
