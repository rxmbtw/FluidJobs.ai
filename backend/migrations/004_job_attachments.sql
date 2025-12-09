-- Job attachments table
CREATE TABLE IF NOT EXISTS job_attachments (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_attachments_job ON job_attachments(job_id);
