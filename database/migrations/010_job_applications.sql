-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  application_id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'submitted',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cover_letter TEXT,
  resume_path VARCHAR(500),
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Add comments
COMMENT ON TABLE job_applications IS 'Stores job applications submitted by candidates';
COMMENT ON COLUMN job_applications.status IS 'Application status: submitted, under_review, shortlisted, rejected, accepted';
