const EMAIL_SUBJECT_FIELDS = [
  'email_subject_verification',
  'email_subject_password_reset',
  'email_subject_instant_link',
  'email_subject_invite',
  'email_subject_security_alert',
];

// Delivery provider/sender settings are host- or environment-owned. The
// standalone server retains legacy rows for API compatibility but does not
// execute them, so the admin surface exposes only effective subject overrides.
export const ALL_EMAIL_FIELDS = EMAIL_SUBJECT_FIELDS;
