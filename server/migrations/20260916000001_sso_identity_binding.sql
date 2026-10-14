CREATE UNIQUE INDEX IF NOT EXISTS user_credentials_sso_provider_subject_unique
ON user_credentials ((metadata ->> 'providerId'), (metadata ->> 'subject'))
WHERE credential_type = 'sso_oidc'
  AND disabled_at IS NULL
  AND metadata ->> 'providerId' IS NOT NULL
  AND metadata ->> 'subject' IS NOT NULL;
