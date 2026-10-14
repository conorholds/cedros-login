import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { useCedrosTheme } from './useCedrosTheme';

describe('useCedrosTheme', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.classList.remove('cedros-dark');
    window.matchMedia = (() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  });

  afterEach(() => {
    document.documentElement.classList.remove('cedros-dark');
    window.matchMedia = originalMatchMedia;
  });

  function createWrapper(config: Parameters<typeof CedrosLoginProvider>[0]['config']) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <CedrosLoginProvider config={config}>{children}</CedrosLoginProvider>;
    };
  }

  it('returns the provider theme contract when styled mode is active', () => {
    const wrapper = createWrapper({
      serverUrl: 'http://localhost:8080',
      features: { email: true },
      theme: 'dark',
      themeOverrides: {
        '--cedros-primary': '#ff0000',
      },
    });

    const { result } = renderHook(() => useCedrosTheme(), { wrapper });

    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.className).toBe('cedros-dark');
    expect(result.current.style).toHaveProperty('--cedros-primary', '#ff0000');
    expect(result.current.unstyled).toBe(false);
    expect(result.current.overrides).toEqual({ '--cedros-primary': '#ff0000' });
  });

  it('returns empty className and style when unstyled mode is active', () => {
    const wrapper = createWrapper({
      serverUrl: 'http://localhost:8080',
      features: { email: true },
      theme: 'dark',
      themeOverrides: {
        '--cedros-primary': '#ff0000',
      },
      unstyled: true,
    });

    const { result } = renderHook(() => useCedrosTheme(), { wrapper });

    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(false);
    expect(result.current.className).toBe('');
    expect(result.current.style).toEqual({});
    expect(result.current.unstyled).toBe(true);
    expect(result.current.overrides).toEqual({ '--cedros-primary': '#ff0000' });
    expect(document.documentElement.classList.contains('cedros-dark')).toBe(false);
  });
});
