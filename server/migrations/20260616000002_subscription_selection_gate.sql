-- Required subscription-plan selection gate.

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('subscription_selection_required', 'false', 'postlogin.subscription', 'Require users to explicitly choose a Cedros Pay subscription plan after registration or login.', FALSE),
  ('subscription_selection_route', '/subscribe', 'postlogin.subscription', 'App route that renders the subscription-plan chooser.', FALSE),
  ('subscription_selection_pay_base_url', '', 'postlogin.subscription', 'Base URL for Cedros Pay subscription-selection endpoints.', FALSE)
ON CONFLICT (key) DO NOTHING;
