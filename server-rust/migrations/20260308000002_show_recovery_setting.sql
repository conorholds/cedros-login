-- Seed setting: show recovery info after account creation
INSERT INTO system_settings (key, value, category, description)
VALUES (
    'postlogin_show_recovery_enabled',
    'false',
    'postlogin.wallet',
    'Show wallet recovery info screen after account creation (when silent enrollment succeeds)'
)
ON CONFLICT (key) DO NOTHING;
