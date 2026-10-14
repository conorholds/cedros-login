import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail, validateSolanaPublicKey } from './validation';

describe('validatePassword', () => {
  const met = (result: ReturnType<typeof validatePassword>, key: string) =>
    result.requirements.find((r) => r.key === key)?.met;

  it('returns the length requirement unmet for an empty value', () => {
    const result = validatePassword('');
    expect(result.requirements.map((r) => r.key)).toEqual(['minLength']);
    expect(result.requirements.every((r) => r.met === false)).toBe(true);
    expect(result.metCount).toBe(0);
    expect(result.isValid).toBe(false);
  });

  it('should fail for short passwords', () => {
    const result = validatePassword('Short1!');
    expect(result.isValid).toBe(false);
    expect(met(result, 'minLength')).toBe(false);
  });

  it('accepts 8 characters and rejects 7, including Unicode passwords', () => {
    expect(validatePassword('x7K#q2L').isValid).toBe(false);
    expect(validatePassword('x7K#q2Lm').isValid).toBe(true);
    expect(validatePassword('🔐'.repeat(7)).isValid).toBe(false);
    expect(validatePassword('🔐'.repeat(8)).isValid).toBe(true);
  });

  it('does not impose character-class composition rules', () => {
    expect(validatePassword('all lowercase passphrase').isValid).toBe(true);
    expect(validatePassword('123456789012345').isValid).toBe(true);
  });

  it('should pass for valid passwords', () => {
    const result = validatePassword('ValidPassphrase1!');
    expect(result.isValid).toBe(true);
    expect(result.metCount).toBe(result.requirements.length);
    expect(result.requirements.every((r) => r.met)).toBe(true);
  });

  it('never reports a positive (good/strong) strength while invalid', () => {
    const result = validatePassword('aA1!');
    expect(result.isValid).toBe(false);
    expect(result.metCount).toBe(0);
    expect(result.strength).toBe('weak');
    expect(['good', 'strong']).not.toContain(result.strength);
  });

  it('rates passwords below the minimum as weak', () => {
    expect(validatePassword('a').strength).toBe('weak');
    expect(validatePassword('short12').strength).toBe('weak');
  });

  it('rates valid passwords good, and long valid passwords strong', () => {
    expect(validatePassword('fifteen chars ok').strength).toBe('good');
    expect(validatePassword('correct horse battery staple').strength).toBe('strong');
  });
});

describe('validateEmail', () => {
  it('should validate correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('no@domain')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('should reject numeric and typo TLDs', () => {
    expect(validateEmail('test@example.123')).toBe(false);
    expect(validateEmail('test@example.con')).toBe(false);
  });
});

describe('validateSolanaPublicKey', () => {
  it('should accept valid 44-character public keys', () => {
    // Example valid Solana public keys (base58 encoded, 44 chars)
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')).toBe(true);
    expect(validateSolanaPublicKey('11111111111111111111111111111111111111111111')).toBe(true);
  });

  it('should accept valid 43-character public keys', () => {
    // Some base58 encoded 32-byte keys can be 43 chars
    expect(validateSolanaPublicKey('7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2')).toBe(true);
  });

  it('should reject keys that are too short', () => {
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pP')).toBe(false);
    expect(validateSolanaPublicKey('short')).toBe(false);
    expect(validateSolanaPublicKey('')).toBe(false);
  });

  it('should reject keys that are too long', () => {
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263X')).toBe(false);
  });

  it('should reject keys with invalid base58 characters', () => {
    // '0' is not valid in base58
    expect(validateSolanaPublicKey('0ezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')).toBe(false);
    // 'O' (uppercase O) is not valid in base58
    expect(validateSolanaPublicKey('OezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')).toBe(false);
    // 'I' (uppercase I) is not valid in base58
    expect(validateSolanaPublicKey('IezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')).toBe(false);
    // 'l' (lowercase L) is not valid in base58
    expect(validateSolanaPublicKey('lezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')).toBe(false);
  });

  it('should reject keys with special characters', () => {
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pP+263')).toBe(false);
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pP/263')).toBe(false);
    expect(validateSolanaPublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pP=263')).toBe(false);
  });
});
