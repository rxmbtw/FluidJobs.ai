-- Job requirements matching table
CREATE TABLE IF NOT EXISTS job_requirements (
    requirement_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs_enhanced(job_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT false,
    min_experience_years NUMERIC(3,1),
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_requirements_job_id ON job_requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_job_requirements_skill_id ON job_requirements(skill_id);
CREATE INDEX IF NOT EXISTS idx_job_requirements_mandatory ON job_requirements(is_mandatory);

-- Ensure unique job-skill combination
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uq_job_skill_requirement'
    ) THEN
        ALTER TABLE job_requirements 
        ADD CONSTRAINT uq_job_skill_requirement 
        UNIQUE (job_id, skill_id);
    END IF;
END $$;