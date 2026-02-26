-- Add missing columns to jobs_enhanced table

ALTER TABLE jobs_enhanced 
ADD COLUMN IF NOT EXISTS job_domain VARCHAR(100),
ADD COLUMN IF NOT EXISTS mode_of_job VARCHAR(50),
ADD COLUMN IF NOT EXISTS min_experience INTEGER,
ADD COLUMN IF NOT EXISTS max_experience INTEGER,
ADD COLUMN IF NOT EXISTS min_salary NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS max_salary NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS show_salary_to_candidate BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS locations TEXT[],
ADD COLUMN IF NOT EXISTS selected_image TEXT,
ADD COLUMN IF NOT EXISTS jd_attachment_name TEXT,
ADD COLUMN IF NOT EXISTS registration_opening_date DATE,
ADD COLUMN IF NOT EXISTS registration_closing_date DATE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_job_domain ON jobs_enhanced(job_domain);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_mode_of_job ON jobs_enhanced(mode_of_job);
