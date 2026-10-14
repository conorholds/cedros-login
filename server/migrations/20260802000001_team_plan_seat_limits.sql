INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES (
  'team_plan_seat_limits',
  '{"individual":1,"business":"unlimited"}',
  'postlogin.subscription',
  'Maximum organization seats by Cedros Pay plan; unlisted plans are unrestricted.',
  FALSE
)
ON CONFLICT (key) DO NOTHING;
