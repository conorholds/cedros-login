import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PasswordInput } from './PasswordInput';

// Helper component for controlled input testing
function ControlledPasswordInput(props: React.ComponentProps<typeof PasswordInput>) {
  const [value, setValue] = useState('');
  return <PasswordInput {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

describe('PasswordInput', () => {
  it('renders with default label', () => {
    render(<PasswordInput />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<PasswordInput label="Enter password" />);
    expect(screen.getByLabelText('Enter password')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('displays error message when error prop is provided', () => {
    render(<PasswordInput error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<PasswordInput error="Error" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput onChange={onChange} />);

    await user.type(screen.getByLabelText('Password'), 'test');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows strength meter when enabled and typing', async () => {
    const user = userEvent.setup();
    // Use controlled component to properly track value changes
    render(<ControlledPasswordInput showStrengthMeter />);

    const input = screen.getByLabelText('Password');
    await user.type(input, 'abc');

    // The strength meter should show "weak" for a short password
    expect(screen.getByText('weak')).toBeInTheDocument();
  });

  it('shows the requirements checklist as soon as the field is focused', () => {
    render(<ControlledPasswordInput showStrengthMeter />);

    fireEvent.focus(screen.getByLabelText('Password'));

    expect(screen.getByText('Your password needs:')).toBeInTheDocument();
    const lengthItem = screen
      .getByText('At least 8 characters')
      .closest('.cedros-password-requirement');
    expect(lengthItem).toHaveAttribute('data-met', 'false');
  });

  it('never shows a positive (good/strong) strength while the password is invalid', async () => {
    const user = userEvent.setup();
    render(<ControlledPasswordInput showStrengthMeter />);

    await user.type(screen.getByLabelText('Password'), 'aA1!');

    expect(screen.getByText('weak')).toBeInTheDocument();
    expect(screen.queryByText('good')).not.toBeInTheDocument();
    expect(screen.queryByText('strong')).not.toBeInTheDocument();
    const lengthItem = screen
      .getByText('At least 8 characters')
      .closest('.cedros-password-requirement');
    expect(lengthItem).toHaveAttribute('data-met', 'false');
  });

  it('keeps every requirement visible and marks them met once valid', async () => {
    const user = userEvent.setup();
    render(<ControlledPasswordInput showStrengthMeter />);

    await user.type(screen.getByLabelText('Password'), 'correct horse battery staple');

    expect(screen.getByText('strong')).toBeInTheDocument();
    const items = document.querySelectorAll('.cedros-password-requirement');
    expect(items).toHaveLength(1);
    items.forEach((item) => expect(item).toHaveAttribute('data-met', 'true'));
  });

  it('calls onValidationChange with password validation', async () => {
    const onValidationChange = vi.fn();
    render(<PasswordInput onValidationChange={onValidationChange} value="" onChange={() => {}} />);

    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'TestPassword123!' } });

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isValid: expect.any(Boolean),
        strength: expect.stringMatching(/weak|fair|good|strong/),
      })
    );
  });

  it('applies custom className', () => {
    const { container } = render(<PasswordInput className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('cedros-password-input');
  });

  it('passes through additional input props', () => {
    render(<PasswordInput placeholder="Enter your password" name="password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('placeholder', 'Enter your password');
    expect(input).toHaveAttribute('name', 'password');
  });
});
