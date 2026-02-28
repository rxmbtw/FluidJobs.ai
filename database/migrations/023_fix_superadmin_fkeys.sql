CREATE TABLE IF NOT EXISTS ai_policies (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE jobs_enhanced DROP CONSTRAINT IF EXISTS jobs_enhanced_status_updated_by_fkey;
ALTER TABLE job_activity_log DROP CONSTRAINT IF EXISTS job_activity_log_performed_by_fkey;
