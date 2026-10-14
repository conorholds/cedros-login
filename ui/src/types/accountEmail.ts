import type { AuthError } from './auth';

/** Email address linked to the authenticated account. */
export interface AccountEmail {
  id: string;
  email: string;
  verified: boolean;
  primary: boolean;
  createdAt: string;
}

/** Response from GET /account/emails and mutating account-email endpoints. */
export interface ListAccountEmailsResponse {
  emails: AccountEmail[];
}

/** Return type for useAccountEmails hook. */
export interface UseAccountEmailsReturn {
  emails: AccountEmail[];
  isLoading: boolean;
  error: AuthError | null;
  fetchEmails: () => Promise<void>;
  addEmail: (email: string) => Promise<void>;
  resendEmail: (id: string) => Promise<void>;
  removeEmail: (id: string) => Promise<void>;
  setPrimaryEmail: (id: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
}
