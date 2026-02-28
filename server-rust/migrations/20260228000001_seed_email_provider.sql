-- Seed the email_provider setting so the admin UI can render the provider dropdown.
-- Existing email settings (smtp_host, smtp_port, etc.) were seeded in 20260130000001
-- but email_provider was missed. Without this row the frontend never receives the key
-- and falls through to the "no settings found" path, hiding the dropdown.

INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES
    ('email_provider', 'custom', 'email', 'Email delivery provider (mailgun, sendgrid, postmark, ses, resend, or custom)', FALSE)
ON CONFLICT (key) DO NOTHING;
