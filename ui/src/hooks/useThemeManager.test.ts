/**
 * Unit tests for useThemeManager hook
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useThemeManager, _resetDarkModeRefCount } from './useThemeManager';

describe('useThemeManager', () => {
  let root: HTMLElement;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    root = document.documentElement;
    root.classList.remove('cedros-dark');
    root.style.cssText = '';
    _resetDarkModeRefCount();
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    root.classList.remove('cedros-dark');
    root.style.cssText = '';
    window.matchMedia = originalMatchMedia;
  });

  describe('theme mode', () => {
    it('should return cedros-dark className for dark theme', () => {
      const { result } = renderHook(() => useThemeManager({ theme: 'dark' }));
      expect(result.current.className).toBe('cedros-dark');
      expect(root.classList.contains('cedros-dark')).toBe(true);
    });

    it('should return empty className for light theme', () => {
      const { result } = renderHook(() => useThemeManager({ theme: 'light' }));
      expect(result.current.className).toBe('');
      expect(root.classList.contains('cedros-dark')).toBe(false);
    });

    it('should remove cedros-dark class when switching to light', () => {
      root.classList.add('cedros-dark');
      renderHook(() => useThemeManager({ theme: 'light' }));
      expect(root.classList.contains('cedros-dark')).toBe(false);
    });

    it('should respect system preference when auto (dark preferred)', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useThemeManager({ theme: 'auto' }));
      expect(result.current.className).toBe('cedros-dark');
      expect(root.classList.contains('cedros-dark')).toBe(true);
    });

    it('should respect system preference when auto (light preferred)', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useThemeManager({ theme: 'auto' }));
      expect(result.current.className).toBe('');
    });
  });

  describe('theme overrides (returned as style object)', () => {
    it('should return CSS variable overrides in style object', () => {
      const { result } = renderHook(() =>
        useThemeManager({
          themeOverrides: {
            '--cedros-primary': '#ff0000',
            '--cedros-background': '#ffffff',
          },
        })
      );

      expect(result.current.style).toHaveProperty('--cedros-primary', '#ff0000');
      expect(result.current.style).toHaveProperty('--cedros-background', '#ffffff');
    });

    it('should not include empty override values', () => {
      const { result } = renderHook(() =>
        useThemeManager({
          themeOverrides: {
            '--cedros-primary': '#ff0000',
            '--cedros-secondary': '',
          },
        })
      );

      expect(result.current.style).toHaveProperty('--cedros-primary', '#ff0000');
      expect(result.current.style).not.toHaveProperty('--cedros-secondary');
    });

    it('should return empty style when no overrides', () => {
      const { result } = renderHook(() => useThemeManager({}));
      expect(Object.keys(result.current.style)).toHaveLength(0);
    });

    it('should forward the deprecated success tint key to its current name', () => {
      const { result } = renderHook(() =>
        useThemeManager({
          themeOverrides: { '--cedros-success-light': '#e6fff0' },
        })
      );

      // The legacy key is still emitted so nothing that reads it breaks, and
      // the stylesheet's current token picks up the same value.
      expect(result.current.style).toHaveProperty('--cedros-success-light', '#e6fff0');
      expect(result.current.style).toHaveProperty('--cedros-login-success-soft', '#e6fff0');
    });

    it('should let an explicit current-name override win over the legacy key', () => {
      const { result } = renderHook(() =>
        useThemeManager({
          themeOverrides: {
            '--cedros-success-light': '#e6fff0',
            '--cedros-login-success-soft': '#d0f0e0',
          },
        })
      );

      expect(result.current.style).toHaveProperty('--cedros-login-success-soft', '#d0f0e0');
    });
  });

  describe('cleanup on unmount', () => {
    it('should remove cedros-dark class on unmount if it was added', () => {
      const { unmount } = renderHook(() => useThemeManager({ theme: 'dark' }));
      expect(root.classList.contains('cedros-dark')).toBe(true);
      unmount();
      expect(root.classList.contains('cedros-dark')).toBe(false);
    });
  });

  describe('combined theme and overrides', () => {
    it('should return both dark className and override style', () => {
      const { result } = renderHook(() =>
        useThemeManager({
          theme: 'dark',
          themeOverrides: {
            '--cedros-primary': '#ff0000',
          },
        })
      );

      expect(result.current.className).toBe('cedros-dark');
      expect(result.current.style).toHaveProperty('--cedros-primary', '#ff0000');
    });
  });

  describe('applyThemeToDocument: false (embedded surfaces)', () => {
    it('should resolve the wrapper className without touching documentElement', () => {
      const { result } = renderHook(() =>
        useThemeManager({ theme: 'dark', applyThemeToDocument: false })
      );
      expect(result.current.className).toBe('cedros-dark');
      expect(root.classList.contains('cedros-dark')).toBe(false);
    });

    it('should not remove an externally applied root class', () => {
      root.classList.add('cedros-dark');
      renderHook(() => useThemeManager({ theme: 'light', applyThemeToDocument: false }));
      expect(root.classList.contains('cedros-dark')).toBe(true);
    });
  });

  describe('multiple provider instances (UI-04)', () => {
    it('should keep cedros-dark when one of two dark providers unmounts', () => {
      const hook1 = renderHook(() => useThemeManager({ theme: 'dark' }));
      const hook2 = renderHook(() => useThemeManager({ theme: 'dark' }));

      expect(root.classList.contains('cedros-dark')).toBe(true);

      hook1.unmount();
      expect(root.classList.contains('cedros-dark')).toBe(true);

      hook2.unmount();
      expect(root.classList.contains('cedros-dark')).toBe(false);
    });
  });

  it('should not throw during server-side render', () => {
    const Component = () => {
      useThemeManager({ theme: 'dark' });
      return null;
    };

    expect(() => renderToString(React.createElement(Component))).not.toThrow();
  });
});
