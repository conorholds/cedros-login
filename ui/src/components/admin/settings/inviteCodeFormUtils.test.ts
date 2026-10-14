import { describe, expect, it } from 'vitest';
import { buildCreateInviteCodeRequest, buildUpdateInviteCodeRequest } from './inviteCodeFormUtils';
import type { InviteCode } from '../../../types';

const invite: InviteCode = {
  id: 'invite-1',
  code: 'WELCOME',
  usesCount: 0,
  active: true,
  discountPercent: 100,
  discountMonths: 3,
  createdAt: '',
  updatedAt: '',
};

describe('invite discount duration', () => {
  it('creates fixed-month free and percentage offers and preserves the forever option', () => {
    for (const percent of ['50', '100']) {
      expect(buildCreateInviteCodeRequest('WELCOME', '', '', '', percent, '3')).toMatchObject({
        discountPercent: Number(percent),
        discountMonths: 3,
      });
      expect(buildCreateInviteCodeRequest('WELCOME', '', '', '', percent, '')).toMatchObject({
        discountPercent: Number(percent),
        discountMonths: null,
      });
    }
  });

  it.each(['0', '-1', '1.5', '3months', 'Infinity', '2147483648'])(
    'rejects invalid month count %s',
    (months) => {
      expect(() => buildCreateInviteCodeRequest('WELCOME', '', '', '', '100', months)).toThrow(
        /whole number/
      );
    }
  );

  it('changes the duration without changing the percentage and can restore forever', () => {
    expect(buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', true, '100', '6')).toEqual({
      discountMonths: 6,
    });
    expect(buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', true, '100', '')).toEqual({
      discountMonths: null,
    });
    expect(buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', true, '100', '3')).toEqual(
      {}
    );
  });

  it('preserves the saved term when an existing caller omits the duration', () => {
    expect(buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', false, '100')).toEqual({
      active: false,
    });
    expect(
      buildUpdateInviteCodeRequest(
        { ...invite, discountMonths: null },
        'WELCOME',
        '',
        '',
        '',
        false,
        '100'
      )
    ).toEqual({ active: false });
  });

  it.each(['50.5', '50garbage', 'Infinity', '0', '101'])(
    'rejects malformed discount percentage %s',
    (percent) => {
      expect(() => buildCreateInviteCodeRequest('WELCOME', '', '', '', percent, '3')).toThrow(
        /Discount must/
      );
      expect(() =>
        buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', true, percent, '3')
      ).toThrow(/Discount must/);
    }
  );

  it('clears the term when removing a discount', () => {
    expect(buildUpdateInviteCodeRequest(invite, 'WELCOME', '', '', '', true, '', '3')).toEqual({
      discountPercent: null,
      discountMonths: null,
    });
  });
});
