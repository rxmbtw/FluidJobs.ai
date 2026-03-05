-- Create candidate_restrictions table
CREATE TABLE IF NOT EXISTS candidate_restrictions (
  restriction_id SERIAL PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL,
  admin_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  restricted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_candidate_restrictions_candidate ON candidate_restrictions(candidate_id);
CREATE INDEX idx_candidate_restrictions_admin ON candidate_restrictions(admin_id);
CREATE INDEX idx_candidate_restrictions_active ON candidate_restrictions(is_active);

-- Add comment
COMMENT ON TABLE candidate_restrictions IS 'Stores candidate restriction history with reasons by admin';
