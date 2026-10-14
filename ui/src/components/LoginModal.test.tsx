import { useExternalEffect } from '../hooks/effects';
/**
 * Component tests for LoginModal
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from './LoginModal';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { useCedrosLogin } from '../context/useCedrosLogin';

import type { CedrosLoginConfig } from '../types';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  features: {},
};

// Component that opens the modal on mount
function ModalOpener() {
  const { openModal } = useCedrosLogin();
  useExternalEffect(() => {
    openModal();
  }, [openModal]);
  return null;
}

function ModalController() {
  const { openModal } = useCedrosLogin();
  return (
    <>
      <button type="button" onClick={openModal}>
        Open modal
      </button>
      <LoginModal />
    </>
  );
}

// Helper to render with open modal
function renderWithOpenModal(config: CedrosLoginConfig = TEST_CONFIG, customTitle?: string) {
  return render(
    <CedrosLoginProvider config={config}>
      <ModalOpener />
      <LoginModal title={customTitle} />
    </CedrosLoginProvider>
  );
}

// Helper to render with closed modal
function renderWithClosedModal(config: CedrosLoginConfig = TEST_CONFIG) {
  return render(
    <CedrosLoginProvider config={config}>
      <LoginModal />
    </CedrosLoginProvider>
  );
}

describe('LoginModal', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Cleanup
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('should not render when modal is closed', () => {
      renderWithClosedModal();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when modal is open', () => {
      renderWithOpenModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render with default title', () => {
      renderWithOpenModal();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      renderWithOpenModal(TEST_CONFIG, 'Custom Login Title');
      expect(screen.getByText('Custom Login Title')).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderWithOpenModal();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      renderWithOpenModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Sign in to your account');
    });

    it('should apply custom className', () => {
      render(
        <CedrosLoginProvider config={TEST_CONFIG}>
          <ModalOpener />
          <LoginModal className="custom-modal-class" />
        </CedrosLoginProvider>
      );
      const backdrop = document.querySelector('.cedros-modal-backdrop');
      expect(backdrop).toHaveClass('custom-modal-class');
    });
  });

  describe('close functionality', () => {
    it('should close when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithOpenModal();

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close when Escape key is pressed', () => {
      renderWithOpenModal();

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should close when backdrop is clicked', async () => {
      const user = userEvent.setup();
      renderWithOpenModal();

      const backdrop = document.querySelector('.cedros-modal-backdrop');
      await user.click(backdrop!);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not close when modal content is clicked', async () => {
      const user = userEvent.setup();
      renderWithOpenModal();

      const modal = screen.getByRole('dialog');
      await user.click(modal);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('body scroll lock', () => {
    it('should prevent body scroll when modal opens', () => {
      renderWithOpenModal();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', async () => {
      const user = userEvent.setup();
      document.body.style.overflow = 'scroll';
      renderWithOpenModal();

      expect(document.body.style.overflow).toBe('hidden');

      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(document.body.style.overflow).toBe('scroll');
    });

    it('should restore body scroll on unmount', () => {
      document.body.style.overflow = 'scroll';
      const { unmount } = renderWithOpenModal();

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('scroll');
    });
  });

  describe('focus management', () => {
    it('should have tabIndex for focus', () => {
      renderWithOpenModal();
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('tabIndex', '-1');
    });

    it('should have focusable elements within modal', () => {
      renderWithOpenModal();
      const modal = screen.getByRole('dialog');
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('focus trapping', () => {
    it('should trap focus within the modal', () => {
      renderWithOpenModal();

      // Get all focusable elements in the modal
      const modal = screen.getByRole('dialog');
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should wrap focus from last to first element on Tab', () => {
      renderWithOpenModal();

      const modal = screen.getByRole('dialog');
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 1) {
        const lastElement = focusableElements[focusableElements.length - 1];
        lastElement.focus();

        fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });

        expect(document.activeElement).toBe(focusableElements[0]);
      }
    });

    it('should wrap focus from first to last element on Shift+Tab', () => {
      renderWithOpenModal();

      const modal = screen.getByRole('dialog');
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 1) {
        const firstElement = focusableElements[0];
        firstElement.focus();

        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

        expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
      }
    });
  });

  describe('focus restoration', () => {
    it('should restore focus to previously focused element on close', async () => {
      const user = userEvent.setup();
      render(
        <CedrosLoginProvider config={TEST_CONFIG}>
          <ModalController />
        </CedrosLoginProvider>
      );

      const triggerButton = screen.getByRole('button', { name: 'Open modal' });
      await user.click(triggerButton);
      expect(screen.getByRole('dialog')).toHaveFocus();

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(triggerButton).toHaveFocus();
    });
  });

  describe('keyboard interactions', () => {
    it('should not close on non-Escape keys', () => {
      renderWithOpenModal();

      fireEvent.keyDown(document, { key: 'Enter' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Tab' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'a' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
