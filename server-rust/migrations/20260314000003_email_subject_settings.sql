-- Custom email subject lines (empty = use default)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('email_subject_verification', '', 'email', 'Custom subject for verification emails. Empty uses default: "Verify your email address"', FALSE),
  ('email_subject_password_reset', '', 'email', 'Custom subject for password reset emails. Empty uses default: "Reset your password"', FALSE),
  ('email_subject_instant_link', '', 'email', 'Custom subject for instant link sign-in emails. Empty uses default: "Your sign-in link"', FALSE),
  ('email_subject_invite', '', 'email', 'Custom subject for organization invite emails. Empty uses default: "You''ve been invited to join {org_name}"', FALSE),
  ('email_subject_security_alert', '', 'email', 'Custom subject for security alert emails. Empty uses default: "New sign-in to your account"', FALSE)
ON CONFLICT (key) DO NOTHING;
