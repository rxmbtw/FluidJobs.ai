-- Add approved_by_role column to candidate_restriction_approvals table
ALTER TABLE candidate_restriction_approvals 
ADD COLUMN IF NOT EXISTS approved_by_role VARCHAR(50);

-- Update existing approved records to have SuperAdmin role
UPDATE candidate_restriction_approvals 
SET approved_by_role = 'SuperAdmin' 
WHERE status IN ('approved', 'rejected') AND approved_by_role IS NULL;

-- Add comment
COMMENT ON COLUMN candidate_restriction_approvals.approved_by_role IS 'Role of the user who approved/rejected the restriction request';