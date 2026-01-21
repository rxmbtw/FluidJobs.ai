-- Create candidate_restriction_approvals table
CREATE TABLE IF NOT EXISTS candidate_restriction_approvals (
  id SERIAL PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  requested_by_user_id INTEGER NOT NULL,
  requested_by_name VARCHAR(255) NOT NULL,
  requested_by_role VARCHAR(50) NOT NULL,
  restriction_reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by_user_id INTEGER,
  approved_by_name VARCHAR(255),
  approved_by_role VARCHAR(50),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to existing candidate_restriction_approvals table
ALTER TABLE candidate_restriction_approvals 
ADD COLUMN IF NOT EXISTS approved_by_role VARCHAR(50);

-- Add missing columns to existing candidate_unrestrictions table
ALTER TABLE candidate_unrestrictions 
ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS unrestricted_by_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS unrestricted_by_role VARCHAR(50);

-- Rename user_id to unrestricted_by_user_id for consistency
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_unrestrictions' AND column_name = 'user_id') THEN
        ALTER TABLE candidate_unrestrictions RENAME COLUMN user_id TO unrestricted_by_user_id;
    END IF;
END $$;

-- Rename reason to unrestriction_reason for clarity
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_unrestrictions' AND column_name = 'reason') THEN
        ALTER TABLE candidate_unrestrictions RENAME COLUMN reason TO unrestriction_reason;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_restriction_approvals_candidate ON candidate_restriction_approvals(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_restriction_approvals_status ON candidate_restriction_approvals(status);
CREATE INDEX IF NOT EXISTS idx_candidate_restriction_approvals_requested_by ON candidate_restriction_approvals(requested_by_user_id);

CREATE INDEX IF NOT EXISTS idx_candidate_unrestrictions_candidate ON candidate_unrestrictions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_unrestrictions_unrestricted_by ON candidate_unrestrictions(unrestricted_by_user_id);

-- Add comments
COMMENT ON TABLE candidate_restriction_approvals IS 'Stores candidate restriction approval requests from admins to superadmin';
COMMENT ON TABLE candidate_unrestrictions IS 'Stores candidate unrestriction actions with reasons';