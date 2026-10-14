import type { PasswordRequirement, PasswordValidation } from "../types";

export interface PasswordValidationMessages {
  minLength: string;
  uppercase: string;
  lowercase: string;
  number: string;
  special: string;
}

const DEFAULT_PASSWORD_VALIDATION_MESSAGES: PasswordValidationMessages = {
  minLength: "At least 8 characters",
  uppercase: "At least 1 uppercase letter",
  lowercase: "At least 1 lowercase letter",
  number: "At least 1 number",
  special: "At least 1 special character (@$!%*?&#^())",
};

/**
 * Allowed special characters for password validation
 *
 * This explicit list prevents spaces, tabs, and non-printable characters
 * from counting as "special". Characters included:
 * - Punctuation: ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; ' : " , . / < > ? ` ~
 * - Escape character: backslash
 */
/** Length at which a fully-valid password is rated `strong` rather than `good`. */
const STRONG_PASSWORD_LENGTH = 20;

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - No composition rules; passphrases and Unicode are accepted
 *
 * Returns every rule in display order for checklist rendering. Strength never
 * reports `good` or `strong` until all requirements are met.
 *
 * Note: All checks are performed regardless of early failures to prevent
 * timing attacks that could reveal which requirements are met.
 */
export function validatePassword(
  password: string,
  messages: PasswordValidationMessages = DEFAULT_PASSWORD_VALIDATION_MESSAGES,
): PasswordValidation {
  // Perform ALL checks first (constant-time approach to prevent timing attacks)
  const hasLength = Array.from(password).length >= 8;

  const requirements: PasswordRequirement[] = [
    { key: "minLength", label: messages.minLength, met: hasLength },
  ];

  const metCount = requirements.reduce(
    (count, req) => count + (req.met ? 1 : 0),
    0,
  );
  const isValid = metCount === requirements.length;

  // Calculate strength
  let strength: PasswordValidation["strength"];
  if (!isValid) {
    strength = password.length < 8 ? "weak" : "fair";
  } else {
    strength = password.length >= STRONG_PASSWORD_LENGTH ? "strong" : "good";
  }

  return {
    isValid,
    requirements,
    metCount,
    strength,
  };
}

const TYPO_TLDS = new Set([
  "con",
  "cmo",
  "ocm",
  "cm",
  "vom",
  "xom",
  "cpm",
  "clm",
  "ney",
  "met",
  "bet",
  "nrt",
  "ogr",
  "rog",
  "prg",
  "irg",
  "edi",
  "rdu",
]);

/**
 * Validate email format with robust validation.
 *
 * Validates:
 * - Proper format with @ symbol
 * - Valid characters in local and domain parts
 * - Domain must have at least one dot (TLD required)
 * - Maximum length per RFC 5321
 *
 * Note on case normalization - This function validates format only,
 * it does NOT normalize case. Per RFC 5321, local-part is technically
 * case-sensitive (though most providers ignore case). Callers should
 * normalize emails (e.g., toLowerCase) before API calls and storage.
 *
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export function validateEmail(email: string): boolean {
  // Check basic constraints
  if (!email || typeof email !== "string") {
    return false;
  }

  if (email.length > 254) {
    return false;
  }

  if (email.includes(" ")) {
    return false;
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;
  if (!local || local.length > 64) {
    return false;
  }

  if (local.startsWith(".") || local.endsWith(".")) {
    return false;
  }

  if (!domain || domain.length > 253) {
    return false;
  }

  if (!domain.includes(".")) {
    return false;
  }

  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.startsWith("-") ||
    domain.endsWith("-")
  ) {
    return false;
  }

  for (const label of domain.split(".")) {
    if (label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
  }

  const tld = domain.split(".").pop();
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
const BASE58_ALPHABET =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

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
