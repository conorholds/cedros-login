/**
 * User profile types.
 */

/**
 * Request to update user profile.
 */
export interface UpdateProfileRequest {
  /** User's display name */
  name?: string;
  /** Unique handle-style username (3-30 chars, lowercase alphanumeric + underscores) */
  username?: string;
  /** User's profile picture URL */
  picture?: string;
}

/**
 * Request to change password.
 */
export interface ChangePasswordRequest {
  /** Current password for verification */
  currentPassword: string;
  /** New password */
  newPassword: string;
}

/**
 * Request to change the account email address.
 */
export interface ChangeEmailRequest {
  /** The new email address */
  newEmail: string;
  /** Current password, required when the account has one (re-auth) */
  currentPassword?: string;
}

/**
 * Response from an email-change request. The new address is unverified until the
 * user confirms it via the verification email queued by the server.
 */
export interface ChangeEmailResponse {
  message: string;
  /** Whether a verification email was queued to the new address */
  emailQueued?: boolean;
}

/**
 * Response from profile update.
 */
export interface UpdateProfileResponse {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  picture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from password change.
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Return type for useProfile hook.
 */
export interface UseProfileReturn {
  /** Whether a profile operation is in progress */
  isLoading: boolean;
  /** Error from last operation */
  error: Error | null;
  /** Update profile (name, username, picture) */
  updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  /** Change password */
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  /** Change the account email (sends a verification email to the new address) */
  changeEmail: (data: ChangeEmailRequest) => Promise<ChangeEmailResponse>;
  /** Clear error state */
  clearError: () => void;
}
