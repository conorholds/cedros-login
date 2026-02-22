import type { PasswordValidation } from '../types';

/**
 * Allowed special characters for password validation (F-07)
 *
 * This explicit list prevents spaces, tabs, and non-printable characters
 * from counting as "special" (H-06 fix). Characters included:
 * - Punctuation: ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; ' : " , . / < > ? ` ~
 * - Escape character: backslash
 */
const SPECIAL_CHARS_PATTERN = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?`~\\]/;

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
export function validatePassword(password: string): PasswordValidation {
  const errors: PasswordValidation['errors'] = {};

  // Perform ALL checks first (constant-time approach to prevent timing attacks)
  const hasLength = password.length >= 10;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  // H-06: Use explicit special character list (see SPECIAL_CHARS_PATTERN)
  const hasSpecial = SPECIAL_CHARS_PATTERN.test(password);

  // Count criteria met
  let criteriaMetCount = 0;

  // Then assign errors based on results
  if (hasLength) {
    criteriaMetCount++;
  } else {
    errors.length = 'At least 10 characters';
  }

  if (hasUppercase) {
    criteriaMetCount++;
  } else {
    errors.uppercase = 'At least 1 uppercase letter';
  }

  if (hasLowercase) {
    criteriaMetCount++;
  } else {
    errors.lowercase = 'At least 1 lowercase letter';
  }

  if (hasNumber) {
    criteriaMetCount++;
  } else {
    errors.number = 'At least 1 number';
  }

  if (hasSpecial) {
    criteriaMetCount++;
  } else {
    errors.special = 'At least 1 special character (@$!%*?&#^())';
  }

  // Calculate strength
  let strength: PasswordValidation['strength'];
  if (criteriaMetCount <= 2) {
    strength = 'weak';
  } else if (criteriaMetCount === 3) {
    strength = 'fair';
  } else if (criteriaMetCount === 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    strength,
  };
}

const TYPO_TLDS = new Set([
  'con',
  'cmo',
  'ocm',
  'cm',
  'vom',
  'xom',
  'cpm',
  'clm',
  'ney',
  'met',
  'bet',
  'nrt',
  'ogr',
  'rog',
  'prg',
  'irg',
  'edi',
  'rdu',
]);

/**
 * Normalize an email address by trimming whitespace and lowercasing.
 *
 * Must be called before API calls and storage to ensure consistent
 * identity matching (RN-04).
 *
 * @param email - The raw email input from the user
 * @returns The normalized email string
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

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
export function validateEmail(email: string): boolean {
  // Check basic constraints
  if (!email || typeof email !== 'string') {
    return false;
  }

  if (email.length > 254) {
    return false;
  }

  if (email.includes(' ')) {
    return false;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;
  if (!local || local.length > 64) {
    return false;
  }

  if (local.startsWith('.') || local.endsWith('.')) {
    return false;
  }

  if (!domain || domain.length > 253) {
    return false;
  }

  if (!domain.includes('.')) {
    return false;
  }

  if (
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.startsWith('-') ||
    domain.endsWith('-')
  ) {
    return false;
  }

  for (const label of domain.split('.')) {
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }
  }

  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  if (!/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  if (TYPO_TLDS.has(tld.toLowerCase())) {
    return false;
  }

  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return false;
  }

  if (!/^[a-zA-Z0-9._\-+!]+$/.test(local)) {
    return false;
  }

  return true;
}

/**
 * Valid Base58 characters (excludes 0, O, I, l to avoid ambiguity)
 */
const BASE58_ALPHABET = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

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
export function validateSolanaPublicKey(publicKey: string): boolean {
  // Check length (base58 encoding of 32 bytes is 43-44 chars)
  if (publicKey.length < 43 || publicKey.length > 44) {
    return false;
  }

  // Check for valid base58 characters only
  return BASE58_ALPHABET.test(publicKey);
}
