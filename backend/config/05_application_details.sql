-- Enhanced application details table
CREATE TABLE IF NOT EXISTS application_details (
    detail_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(application_id) ON DELETE CASCADE,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    cover_letter TEXT,
    additional_skills TEXT[],
    availability_date DATE,
    salary_expectation NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_details_app_id ON application_details(application_id);
CREATE INDEX IF NOT EXISTS idx_application_details_created ON application_details(created_at);

-- Ensure one-to-one relationship
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uq_application_details_app_id'
    ) THEN
        ALTER TABLE application_details 
        ADD CONSTRAINT uq_application_details_app_id 
        UNIQUE (application_id);
    END IF;
END $$;