-- Saved jobs table for candidate bookmarks
CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_job_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs_enhanced(job_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id ON saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Ensure unique candidate-job combination
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uq_saved_job'
    ) THEN
        ALTER TABLE saved_jobs 
        ADD CONSTRAINT uq_saved_job 
        UNIQUE (candidate_id, job_id);
    END IF;
END $$;