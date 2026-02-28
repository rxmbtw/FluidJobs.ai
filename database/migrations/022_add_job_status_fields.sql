-- Migration: Add Job Status Enhancements
-- Adds status tracking and activity log functionality

-- 1. Add new status fields to jobs_enhanced table
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS status_reason TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status_updated_by INTEGER REFERENCES users(id);

-- 2. Create the job_activity_log table
CREATE TABLE IF NOT EXISTS job_activity_log (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- e.g., 'Created', 'Paused', 'Re-activated', 'Closed'
    performed_by INTEGER NOT NULL REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for the new table
CREATE INDEX IF NOT EXISTS idx_job_activity_log_job_id ON job_activity_log(job_id);
CREATE INDEX IF NOT EXISTS idx_job_activity_log_performed_by ON job_activity_log(performed_by);

-- 4. Add comments
COMMENT ON COLUMN jobs_enhanced.status_reason IS 'Reason provided when job status is changed to Paused or Closed';
COMMENT ON COLUMN jobs_enhanced.status_updated_at IS 'Timestamp of the last status change';
COMMENT ON COLUMN jobs_enhanced.status_updated_by IS 'User ID who last updated the status';
COMMENT ON TABLE job_activity_log IS 'Tracks all historical status changes and important events for a job';
