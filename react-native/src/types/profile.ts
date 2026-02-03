/**
 * User profile types
 *
 * Types for user profile management including updates and password changes.
 */

/**
 * Request to update user profile
 */
export interface UpdateProfileRequest {
  /** User's display name */
  name?: string;
  /** User's profile picture URL */
  picture?: string;
}

/**
 * Request to change password
 */
export interface ChangePasswordRequest {
  /** Current password for verification */
  currentPassword: string;
  /** New password */
  newPassword: string;
}

/**
 * Response from profile update
 */
export interface UpdateProfileResponse {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from password change
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * Return type for useProfile hook
 */
export interface UseProfileReturn {
  /** Whether a profile operation is in progress */
  isLoading: boolean;
  /** Error from last operation */
  error: Error | null;
  /** Update profile (name, picture) */
  updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  /** Change password */
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}
