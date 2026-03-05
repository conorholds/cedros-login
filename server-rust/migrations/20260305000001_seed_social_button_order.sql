-- Seed the default social button display order for the login form.
-- Admins can reorder via the admin dashboard; the login UI reads
-- this from GET /features -> socialButtonOrder.
INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES ('ui_social_button_order', 'webauthn,google,apple,solana', 'ui', 'Order of social login buttons on the login form', FALSE)
ON CONFLICT (key) DO NOTHING;
