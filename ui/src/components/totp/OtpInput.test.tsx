import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from './OtpInput';

function Harness({ onComplete = () => {} }: { onComplete?: (code: string) => void }) {
  const [value, setValue] = useState('');
  return <OtpInput value={value} onChange={setValue} onComplete={onComplete} error="Try again" />;
}

describe('OTP input compatibility', () => {
  it('accepts full-code autofill and associates the error with each field', () => {
    const complete = vi.fn();
    render(<Harness onComplete={complete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '123456' } });
    expect(inputs.map((input) => (input as HTMLInputElement).value).join('')).toBe('123456');
    expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
    for (const input of inputs) expect(input).toHaveAccessibleDescription('Try again');
  });

  it('does not shift later digits or submit an incomplete code while editing', async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<Harness onComplete={complete} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '123456' } });
    complete.mockClear();
    await user.click(inputs[2]);
    await user.keyboard('{Backspace}');
    expect(inputs[2]).toHaveValue('');
    expect(inputs[3]).toHaveValue('4');
    expect(complete).not.toHaveBeenCalled();
    await user.type(inputs[2], '9');
    expect(complete).toHaveBeenCalledExactlyOnceWith('129456');
  });

  it('accepts a pasted formatted code', async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<Harness onComplete={complete} />);
    await user.click(screen.getAllByRole('textbox')[0]);
    await user.paste('123 456');
    expect(complete).toHaveBeenCalledExactlyOnceWith('123456');
  });
});
