-- Reorderable post-login flow setting.

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('postlogin_flow_order', 'subscription,username,welcome,profile', 'postlogin', 'Order of reorderable post-login flow steps.', FALSE)
ON CONFLICT (key) DO NOTHING;
