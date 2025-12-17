-- Create unpublish_requests table
CREATE TABLE IF NOT EXISTS unpublish_requests (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    reason TEXT,
    requested_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint if jobs_enhanced table exists
-- ALTER TABLE unpublish_requests ADD CONSTRAINT fk_job_id FOREIGN KEY (job_id) REFERENCES jobs_enhanced(job_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_unpublish_requests_status ON unpublish_requests(status);
CREATE INDEX IF NOT EXISTS idx_unpublish_requests_job_id ON unpublish_requests(job_id);