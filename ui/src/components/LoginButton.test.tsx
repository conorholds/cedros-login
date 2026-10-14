import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginButton } from './LoginButton';

vi.mock('../hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: { name: 'AT&T', email: 'user@example.com', picture: null },
      isAuthenticated: true,
      isLoading: false,
      openLoginModal: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('LoginButton', () => {
  it('renders user display name without double escaping', () => {
    render(<LoginButton />);
    expect(screen.getByText('AT&T')).toBeInTheDocument();
  });

  it('does not open menu when there are no menu items', async () => {
    const user = userEvent.setup();
    render(<LoginButton hideSignOut />);

    const button = screen.getByRole('button', { name: /user menu/i });
    await user.click(button);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
