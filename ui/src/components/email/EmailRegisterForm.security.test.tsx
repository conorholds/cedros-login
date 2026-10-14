import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CedrosLoginProvider } from '../../context/CedrosLoginProvider';
import type { CedrosLoginConfig } from '../../types';
import { EmailRegisterForm } from './EmailRegisterForm';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
  forms: {
    termsOfService: {
      show: true,
      required: true,
      label: 'I agree to the Terms of Service',
      url: 'javascript:alert(1)',
    },
  },
};

describe('EmailRegisterForm (security)', () => {
  it('should not render a Terms of Service link for unsafe termsUrl', () => {
    render(
      <CedrosLoginProvider config={TEST_CONFIG}>
        <EmailRegisterForm />
      </CedrosLoginProvider>
    );

    expect(screen.queryByRole('link', { name: 'Terms of Service' })).toBeNull();
    expect(screen.getByText(/I agree to the Terms of Service/i)).toBeInTheDocument();
  });
});
