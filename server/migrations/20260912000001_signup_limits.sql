INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES
    ('signup_limit_enabled', 'false', 'auth.signup_limits', 'Limit new account registrations per UTC calendar period', FALSE),
    ('signup_limit_period', 'monthly', 'auth.signup_limits', 'UTC calendar period used for the signup limit', FALSE),
    ('signup_limit_max', '100', 'auth.signup_limits', 'Maximum new accounts allowed per signup limit period', FALSE),
    ('signup_limit_show_remaining', 'false', 'auth.signup_limits', 'Show remaining signup capacity on public registration forms', FALSE)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS signup_limit_state (
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
    period_start TIMESTAMPTZ NOT NULL,
    used BIGINT NOT NULL CHECK (used >= 0),
    PRIMARY KEY (period, period_start)
);

CREATE OR REPLACE FUNCTION enforce_signup_limit()
RETURNS TRIGGER AS $$
DECLARE
    limit_enabled BOOLEAN;
    limit_period TEXT;
    limit_max BIGINT;
    current_start TIMESTAMPTZ;
    next_start TIMESTAMPTZ;
    state_used BIGINT;
BEGIN
    IF NEW.is_system_admin THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE((SELECT value::BOOLEAN FROM system_settings WHERE key = 'signup_limit_enabled'), FALSE),
           COALESCE((SELECT value FROM system_settings WHERE key = 'signup_limit_period'), 'monthly'),
           COALESCE((SELECT value::BIGINT FROM system_settings WHERE key = 'signup_limit_max'), 100)
      INTO limit_enabled, limit_period, limit_max;

    IF NOT limit_enabled THEN
        RETURN NEW;
    END IF;

    CASE limit_period
        WHEN 'daily' THEN
            current_start := date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
            next_start := current_start + INTERVAL '1 day';
        WHEN 'weekly' THEN
            current_start := date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
            next_start := current_start + INTERVAL '1 week';
        WHEN 'monthly' THEN
            current_start := date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
            next_start := current_start + INTERVAL '1 month';
        ELSE
            RAISE EXCEPTION 'invalid signup_limit_period' USING ERRCODE = '22023';
    END CASE;

    INSERT INTO signup_limit_state (period, period_start, used)
    SELECT limit_period, current_start, COUNT(*)
      FROM users
     WHERE NOT is_system_admin
       AND created_at >= current_start
       AND created_at < next_start
    ON CONFLICT (period, period_start) DO NOTHING;

    UPDATE signup_limit_state
       SET used = used
     WHERE period = limit_period AND period_start = current_start
     RETURNING used INTO state_used;

    IF state_used >= limit_max THEN
        RAISE EXCEPTION '%', 'cedros_signup_limit_reached|' || to_char(next_start AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
            USING ERRCODE = 'P0001';
    END IF;

    UPDATE signup_limit_state
       SET used = used + 1
     WHERE period = limit_period AND period_start = current_start;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_signup_limit_before_insert ON users;
CREATE TRIGGER enforce_signup_limit_before_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION enforce_signup_limit();
