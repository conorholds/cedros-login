import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PathInput } from './PathInput';
import { cleanSlug, normalizeSlug, slugToPath } from './routePath';

describe('routePath normalization', () => {
  it('cleanSlug fixes quotes/whitespace/duplicate+leading slashes but keeps a trailing slash', () => {
    expect(cleanSlug('welcome')).toBe('welcome');
    expect(cleanSlug('  welcome  ')).toBe('welcome');
    expect(cleanSlug('/welcome')).toBe('welcome');
    expect(cleanSlug('///welcome')).toBe('welcome');
    expect(cleanSlug('"welcome"')).toBe('welcome');
    expect(cleanSlug('"welcome')).toBe('welcome'); // unbalanced quote
    expect(cleanSlug('wel come')).toBe('welcome');
    expect(cleanSlug('app//welcome')).toBe('app/welcome');
    // Trailing slash survives so a sub-path can still be typed.
    expect(cleanSlug('app/')).toBe('app/');
  });

  it('normalizeSlug additionally drops the trailing slash', () => {
    expect(normalizeSlug('/welcome/')).toBe('welcome');
    expect(normalizeSlug('"welcome/"')).toBe('welcome');
    expect(normalizeSlug('app//welcome/')).toBe('app/welcome');
    expect(normalizeSlug('')).toBe('');
  });

  it('slugToPath joins a slug to a path and clears on empty', () => {
    expect(slugToPath('welcome')).toBe('/welcome');
    expect(slugToPath('app/welcome')).toBe('/app/welcome');
    expect(slugToPath('')).toBe('');
  });
});

describe('PathInput component', () => {
  it('renders the slug without its leading slash and shows the / affix', () => {
    render(<PathInput value="/welcome" onChange={vi.fn()} placeholder="welcome" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('welcome');
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('stores a leading-slash path and drops a slash the user types (no double slash)', () => {
    const onChange = vi.fn();
    render(<PathInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '/welcome' } });
    expect(onChange).toHaveBeenLastCalledWith('/welcome');
  });

  it('persists a clean value on change before any blur (doubled slash collapsed)', () => {
    const onChange = vi.fn();
    render(<PathInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'app//welcome' } });
    expect(onChange).toHaveBeenLastCalledWith('/app/welcome');
  });

  it('keeps a trailing slash while typing a sub-path (caret not fought)', () => {
    const onChange = vi.fn();
    render(<PathInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'app/' } });
    expect(onChange).toHaveBeenLastCalledWith('/app/');
  });

  it('normalizes quotes and a trailing slash on blur', () => {
    const onChange = vi.fn();
    render(<PathInput value="" onChange={onChange} />);
    fireEvent.blur(screen.getByRole('textbox'), { target: { value: '"welcome/"' } });
    expect(onChange).toHaveBeenLastCalledWith('/welcome');
  });

  it('does not fire onChange on blur when the normalized value is unchanged', () => {
    const onChange = vi.fn();
    render(<PathInput value="/welcome" onChange={onChange} />);
    fireEvent.blur(screen.getByRole('textbox'), { target: { value: 'welcome' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the value when the field is emptied', () => {
    const onChange = vi.fn();
    render(<PathInput value="/welcome" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});
