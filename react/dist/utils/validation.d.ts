import { PasswordValidation } from '../types';
/**
 * Password validation rules:
 * - Minimum 10 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (@$!%*?&#^())
 *
 * Note: All checks are performed regardless of early failures to prevent
 * timing attacks that could reveal which requirements are met.
 */
export declare function validatePassword(password: string): PasswordValidation;
/**
 * Validate email format with robust validation.
 *
 * Validates:
 * - Proper format with @ symbol
 * - Valid characters in local and domain parts
 * - Domain must have at least one dot (TLD required)
 * - Maximum length per RFC 5321
 *
 * UI-13: Note on case normalization - This function validates format only,
 * it does NOT normalize case. Per RFC 5321, local-part is technically
 * case-sensitive (though most providers ignore case). Callers should
 * normalize emails (e.g., toLowerCase) before API calls and storage.
 *
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export declare function validateEmail(email: string): boolean;
/**
 * Validate Solana public key format.
 *
 * A valid Solana public key:
 * - Is 43-44 characters long (base58 encoding of 32 bytes)
 * - Contains only valid base58 characters
 *
 * @param publicKey - The public key string to validate
 * @returns true if the public key format is valid
 *
 * @example
 * ```ts
 * validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263') // true
 * validateSolanaPublicKey('invalid') // false
 * ```
 */
export declare function validateSolanaPublicKey(publicKey: string): boolean;
