import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const addEmailMock = vi.hoisted(() => vi.fn());
const hookState = vi.hoisted(() => ({
  emails: [] as unknown[],
}));

vi.mock('../../hooks/useAccountEmails', () => ({
  useAccountEmails: () => ({
    emails: hookState.emails,
    isLoading: false,
    error: null,
    addEmail: addEmailMock,
    resendEmail: vi.fn(),
    removeEmail: vi.fn(),
    setPrimaryEmail: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import { EmailManagement } from './EmailManagement';

function submitAddress(address: string) {
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: address } });
  fireEvent.click(screen.getByRole('button', { name: 'Add email' }));
}

describe('EmailManagement', () => {
  beforeEach(() => {
    addEmailMock.mockReset();
    hookState.emails = [];
  });

  it('renders its own header by default', () => {
    render(<EmailManagement />);
    expect(screen.getByRole('heading', { name: 'Email addresses' })).toBeInTheDocument();
  });

  it('hides the header and reports successful adds via onEmailChange', async () => {
    addEmailMock.mockResolvedValue([]);
    const onEmailChange = vi.fn();
    render(<EmailManagement showHeader={false} onEmailChange={onEmailChange} />);

    expect(screen.queryByRole('heading', { name: 'Email addresses' })).not.toBeInTheDocument();

    submitAddress('new@example.com');
    await waitFor(() => expect(addEmailMock).toHaveBeenCalledWith('new@example.com'));
    expect(await screen.findByText('Verification sent to new@example.com.')).toBeInTheDocument();
    expect(onEmailChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onEmailChange when adding fails', async () => {
    addEmailMock.mockRejectedValue(new Error('nope'));
    const onEmailChange = vi.fn();
    render(<EmailManagement onEmailChange={onEmailChange} />);

    submitAddress('bad@example.com');
    await waitFor(() => expect(addEmailMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add email' })).toBeEnabled());
    expect(onEmailChange).not.toHaveBeenCalled();
    expect(screen.queryByText(/Verification sent to/)).not.toBeInTheDocument();
  });
});
