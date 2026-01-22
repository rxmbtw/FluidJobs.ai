-- Add unrestriction fields to candidate_restriction_approvals table
ALTER TABLE candidate_restriction_approvals 
ADD COLUMN unrestricted_by_user_id INTEGER,
ADD COLUMN unrestricted_by_name VARCHAR(255),
ADD COLUMN unrestricted_by_role VARCHAR(50),
ADD COLUMN unrestricted_at TIMESTAMP,
ADD COLUMN unrestriction_reason TEXT;

-- Add index for better query performance
CREATE INDEX idx_candidate_restriction_approvals_status ON candidate_restriction_approvals(status);
CREATE INDEX idx_candidate_restriction_approvals_candidate_id ON candidate_restriction_approvals(candidate_id);