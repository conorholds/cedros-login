/**
 * Setup types for first-run configuration
 */

/** Response from setup status check */
export interface SetupStatusResponse {
  /** Whether initial setup is needed (no admin exists) */
  needsSetup: boolean;
  /** Whether at least one admin user exists */
  hasAdmin: boolean;
  /** Server version for compatibility checking */
  serverVersion: string;
}

/** Request to create the first admin user */
export interface CreateFirstAdminRequest {
  /** Admin email address */
  email: string;
  /** Admin password */
  password: string;
  /** Optional display name */
  name?: string;
  /** Organization name (defaults to "My Organization" on server) */
  orgName?: string;
}

/** Response after creating first admin */
export interface CreateFirstAdminResponse {
  /** Whether admin was successfully created */
  success: boolean;
  /** Created user ID */
  userId: string;
  /** Message for the user */
  message: string;
}

/** Return type for useSetup hook */
export interface UseSetupReturn {
  /** Current setup status */
  status: SetupStatusResponse | null;
  /** Whether status is loading */
  isLoading: boolean;
  /** Whether admin creation is in progress */
  isCreating: boolean;
  /** Error if any */
  error: Error | null;
  /** Check setup status */
  checkStatus: () => Promise<void>;
  /** Create first admin */
  createAdmin: (request: CreateFirstAdminRequest) => Promise<CreateFirstAdminResponse>;
}
