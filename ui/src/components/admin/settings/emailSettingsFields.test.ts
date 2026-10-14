import { describe, expect, it } from 'vitest';
import { ALL_EMAIL_FIELDS } from './emailSettingsFields';

describe('email settings fields', () => {
  it('exposes subject overrides without inert sender controls', () => {
    expect(ALL_EMAIL_FIELDS).toEqual([
      'email_subject_verification',
      'email_subject_password_reset',
      'email_subject_instant_link',
      'email_subject_invite',
      'email_subject_security_alert',
    ]);

    for (const key of [
      'email_provider',
      'email_smtp_host',
      'email_smtp_password',
      'email_from_address',
      'email_from_name',
    ]) {
      expect(ALL_EMAIL_FIELDS).not.toContain(key);
    }
  });
});
