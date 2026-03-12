-- Migration: Job Edit Requests and Approval Workflow
-- Enables approval workflow for job edits by non-admin users

CREATE TABLE IF NOT EXISTS job_edit_requests (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Store the proposed changes and original values
    changes_json JSONB NOT NULL,
    original_values_json JSONB,
    change_summary TEXT,
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_edit_requests_job_id ON job_edit_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_edit_requests_requested_by ON job_edit_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_job_edit_requests_status ON job_edit_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_edit_requests_reviewed_by ON job_edit_requests(reviewed_by);

-- Comments
COMMENT ON TABLE job_edit_requests IS 'Stores job edit requests that require approval from Admin/SuperAdmin';
COMMENT ON COLUMN job_edit_requests.changes_json IS 'JSON object containing the proposed changes';
COMMENT ON COLUMN job_edit_requests.original_values_json IS 'JSON object containing the original job values before edit';
COMMENT ON COLUMN job_edit_requests.status IS 'Status of the edit request: pending, approved, rejected';
