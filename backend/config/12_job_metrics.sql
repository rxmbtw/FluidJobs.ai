-- Job performance metrics table
CREATE TABLE IF NOT EXISTS job_metrics (
    metric_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs_enhanced(job_id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    qualified_applications INTEGER DEFAULT 0,
    interviews_scheduled INTEGER DEFAULT 0,
    hires_made INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_metrics_job_id ON job_metrics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_metrics_updated ON job_metrics(last_updated);

-- Ensure one-to-one relationship
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uq_job_metrics_job_id'
    ) THEN
        ALTER TABLE job_metrics 
        ADD CONSTRAINT uq_job_metrics_job_id 
        UNIQUE (job_id);
    END IF;
END $$;