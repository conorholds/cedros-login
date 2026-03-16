-- Accredited Investor Verification
--
-- Self-service submission + admin review workflow.
-- Documents stored in S3 (private ACL, pre-signed URLs for admin access).

-- Add accreditation columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS accreditation_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS accreditation_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accreditation_expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_accreditation_status ON users (accreditation_status);

-- Accreditation submissions (one per verification attempt, immutable after submission)
CREATE TABLE IF NOT EXISTS accreditation_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- Method-specific fields
  income_type TEXT,                        -- 'individual' or 'joint'
  stated_amount_usd NUMERIC,              -- income or net worth amount
  crd_number TEXT,                         -- FINRA CRD number
  license_type TEXT,                       -- series_7, series_65, series_82
  investment_commitment_usd NUMERIC,       -- for investment_threshold method
  entity_type TEXT,                         -- 'individual' or 'entity'
  user_statement TEXT,                     -- free-text (income expectation, insider cert, etc.)
  -- Admin review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT accreditation_submissions_method_check CHECK (
    method IN ('income', 'net_worth', 'credential', 'third_party_letter', 'insider', 'investment_threshold')
  ),
  CONSTRAINT accreditation_submissions_status_check CHECK (
    status IN ('pending', 'approved', 'rejected')
  )
);
CREATE INDEX IF NOT EXISTS idx_accreditation_submissions_user_id ON accreditation_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_accreditation_submissions_status ON accreditation_submissions (status);

-- Documents attached to submissions
CREATE TABLE IF NOT EXISTS accreditation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES accreditation_submissions(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  original_filename TEXT,
  content_type TEXT,
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT accreditation_documents_type_check CHECK (
    document_type IN (
      'tax_w2', 'tax_1040', 'tax_1099', 'tax_k1',
      'bank_statement', 'brokerage_statement', 'property_appraisal', 'credit_report',
      'verification_letter', 'other'
    )
  )
);
CREATE INDEX IF NOT EXISTS idx_accreditation_documents_submission_id ON accreditation_documents (submission_id);

-- Seed settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('accreditation_enabled', 'false', 'accreditation', 'Enable accredited investor verification', false),
  ('accreditation_enforcement_mode', 'none', 'accreditation', 'When to enforce: none, optional, required', false),
  ('accreditation_default_expiry_days_income', '365', 'accreditation', 'Default expiry for income/net-worth verifications (days)', false),
  ('accreditation_default_expiry_days_letter', '90', 'accreditation', 'Default expiry for third-party letter verifications (days)', false),
  ('accreditation_default_expiry_days_credential', '365', 'accreditation', 'Default expiry for credential verifications (days)', false),
  ('accreditation_max_upload_size_mb', '10', 'accreditation', 'Max file size per document upload (MB)', false),
  ('accreditation_income_threshold_individual', '200000', 'accreditation', 'Income threshold for individual (USD)', false),
  ('accreditation_income_threshold_joint', '300000', 'accreditation', 'Income threshold for joint (USD)', false),
  ('accreditation_net_worth_threshold', '1000000', 'accreditation', 'Net worth threshold excluding primary residence (USD)', false),
  ('accreditation_investment_threshold_individual', '200000', 'accreditation', 'Investment commitment threshold individual (USD)', false),
  ('accreditation_investment_threshold_entity', '1000000', 'accreditation', 'Investment commitment threshold entity (USD)', false)
ON CONFLICT (key) DO NOTHING;
