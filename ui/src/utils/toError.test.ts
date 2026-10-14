import { describe, expect, it } from 'vitest';
import { toError } from './toError';

describe('toError', () => {
  it('returns Error instances unchanged', () => {
    const original = new Error('boom');
    expect(toError(original)).toBe(original);
  });

  it('extracts the message from AuthError-shaped objects (no "[object Object]")', () => {
    const authError = { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' };
    const result = toError(authError);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Incorrect email or password.');
  });

  it('uses the fallback when the object has no usable message', () => {
    const apiError = { isApiError: true, status: 500, message: '   ' };
    expect(toError(apiError, 'Unable to sign in.').message).toBe('Unable to sign in.');
  });

  it('falls back for objects without a message field', () => {
    expect(toError({ isApiError: true, data: { code: 'x' } }).message).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('wraps non-empty strings', () => {
    expect(toError('plain failure').message).toBe('plain failure');
  });
});
