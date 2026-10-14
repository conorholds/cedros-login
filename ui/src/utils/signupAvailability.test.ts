import { describe, expect, it } from 'vitest';

import { parseSignupAvailability } from './signupAvailability';

describe('parseSignupAvailability', () => {
  it('accepts a valid quota snapshot', () => {
    expect(
      parseSignupAvailability({
        remaining: 12,
        limit: 100,
        period: 'monthly',
        resetsAt: '2099-10-01T00:00:00Z',
      })
    ).toEqual({
      remaining: 12,
      limit: 100,
      period: 'monthly',
      resetsAt: '2099-10-01T00:00:00Z',
    });
  });

  it.each([
    null,
    { remaining: -1, limit: 100, period: 'monthly', resetsAt: '2099-10-01T00:00:00Z' },
    { remaining: 101, limit: 100, period: 'monthly', resetsAt: '2099-10-01T00:00:00Z' },
    { remaining: 12, limit: 100, period: 'yearly', resetsAt: '2099-10-01T00:00:00Z' },
    { remaining: 12, limit: 100, period: 'monthly', resetsAt: 'not-a-date' },
    { remaining: 12, limit: 100, period: 'monthly', resetsAt: '2099-10-01T00:00:00' },
    { remaining: 12, limit: 100, period: 'monthly', resetsAt: '2020-10-01T00:00:00Z' },
  ])('rejects malformed public data: %j', (value) => {
    expect(parseSignupAvailability(value)).toBeUndefined();
  });
});
