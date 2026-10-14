-- Post-login flow settings and welcome_completed_at column

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('postlogin_redirect_url', '', 'postlogin', 'URL to redirect to after login (empty = default behavior)', FALSE),
  ('postlogin_welcome_enabled', 'false', 'postlogin.welcome', 'Show a one-time welcome page to new users after login', FALSE),
  ('postlogin_welcome_route', '/welcome', 'postlogin.welcome', 'Route for the welcome/onboarding page', FALSE),
  ('postlogin_complete_enabled', 'false', 'postlogin.complete', 'Prompt users to fill in missing profile info after login', FALSE)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_completed_at TIMESTAMPTZ;
