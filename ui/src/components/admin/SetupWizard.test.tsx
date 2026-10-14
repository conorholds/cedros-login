import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({
  setupState: {
    status: { needsSetup: true },
    isLoading: false,
    isCreating: false,
    error: null as Error | null,
    checkStatus: vi.fn(async () => {}),
    createAdmin: vi.fn(async () => ({ message: 'created' })),
  },
}));

vi.mock('../../hooks/useSetup', () => ({
  useSetup: () => mocked.setupState,
}));

import { SetupWizard } from './SetupWizard';

describe('SetupWizard accessibility', () => {
  beforeEach(() => {
    mocked.setupState.status = { needsSetup: true };
    mocked.setupState.isLoading = false;
    mocked.setupState.isCreating = false;
    mocked.setupState.error = null;
    mocked.setupState.checkStatus.mockClear();
    mocked.setupState.createAdmin.mockClear();
    mocked.setupState.createAdmin.mockResolvedValue({ message: 'created' });
  });

  it('associates validation errors with their fields', async () => {
    const user = userEvent.setup();
    render(<SetupWizard />);

    await user.click(screen.getByRole('button', { name: 'Create Admin Account' }));

    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/^password/i);
    const confirmPassword = screen.getByLabelText(/confirm password/i);

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Email is required');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAccessibleDescription('Password is required');
    expect(confirmPassword).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPassword).toHaveAccessibleDescription('Please confirm your password');
  });

  it('submits valid first-admin setup values', async () => {
    const user = userEvent.setup();
    render(<SetupWizard />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Admin User');
    await user.type(screen.getByLabelText(/organization name/i), 'Cedros');
    await user.type(screen.getByLabelText(/^password/i), 'correct horse');
    await user.type(screen.getByLabelText(/confirm password/i), 'correct horse');
    await user.click(screen.getByRole('button', { name: 'Create Admin Account' }));

    expect(mocked.setupState.createAdmin).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'correct horse',
      name: 'Admin User',
      orgName: 'Cedros',
    });
  });

  it('runs completion callback only after first-admin setup succeeds', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'correct horse');
    await user.type(screen.getByLabelText(/confirm password/i), 'correct horse');
    await user.click(screen.getByRole('button', { name: 'Create Admin Account' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not run completion callback when first-admin setup fails', async () => {
    mocked.setupState.createAdmin.mockRejectedValue(new Error('Setup failed'));
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);

    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'correct horse');
    await user.type(screen.getByLabelText(/confirm password/i), 'correct horse');
    await user.click(screen.getByRole('button', { name: 'Create Admin Account' }));

    expect(onComplete).not.toHaveBeenCalled();
  });
});
