-- Enhanced Jobs table schema for FluidJobs.ai
-- Adds support for additional job creation fields

-- Drop existing jobs table if you want to recreate with new structure
-- DROP TABLE IF EXISTS jobs CASCADE;

-- Create enhanced Jobs table
CREATE TABLE IF NOT EXISTS jobs_enhanced (
    job_id SERIAL PRIMARY KEY,
    company_id INTEGER DEFAULT 1, -- Default company for now
    
    -- Basic job info
    job_title VARCHAR(255) NOT NULL,
    job_domain VARCHAR(100),
    job_type VARCHAR(50),
    locations TEXT[], -- Array of locations
    mode_of_job VARCHAR(50),
    
    -- Experience and skills
    min_experience INTEGER DEFAULT 0,
    max_experience INTEGER DEFAULT 10,
    skills TEXT[], -- Array of skills
    
    -- Salary info
    min_salary NUMERIC(12,2),
    max_salary NUMERIC(12,2),
    show_salary_to_candidate BOOLEAN DEFAULT true,
    
    -- Job description and image
    job_description TEXT,
    selected_image TEXT,
    
    -- New additional fields
    jd_attachment_name VARCHAR(255), -- Store filename of uploaded JD
    eligible_courses TEXT[], -- Array of eligible courses
    eligibility_criteria TEXT,
    selection_process TEXT,
    other_details TEXT,
    
    -- Organization details
    registration_schedule VARCHAR(255),
    about_organisation TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    organisation_size VARCHAR(50),
    contact_person VARCHAR(255),
    
    -- Job management
    job_close_days INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'Published',
    published_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_status ON jobs_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_job_domain ON jobs_enhanced(job_domain);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_job_type ON jobs_enhanced(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_published_date ON jobs_enhanced(published_date);

-- Create trigger for updated_at
CREATE TRIGGER update_jobs_enhanced_updated_at 
    BEFORE UPDATE ON jobs_enhanced 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create job drafts table for saving work in progress
CREATE TABLE IF NOT EXISTS job_drafts (
    draft_id SERIAL PRIMARY KEY,
    user_id VARCHAR(100), -- Can be session ID or user ID
    
    -- All the same fields as jobs_enhanced for draft storage
    job_title VARCHAR(255),
    job_domain VARCHAR(100),
    job_type VARCHAR(50),
    locations TEXT[],
    mode_of_job VARCHAR(50),
    min_experience INTEGER DEFAULT 0,
    max_experience INTEGER DEFAULT 10,
    skills TEXT[],
    min_salary NUMERIC(12,2),
    max_salary NUMERIC(12,2),
    show_salary_to_candidate BOOLEAN DEFAULT true,
    job_description TEXT,
    selected_image TEXT,
    jd_attachment_name VARCHAR(255),
    eligible_courses TEXT[],
    eligibility_criteria TEXT,
    selection_process TEXT,
    other_details TEXT,
    registration_schedule VARCHAR(255),
    about_organisation TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    organisation_size VARCHAR(50),
    contact_person VARCHAR(255),
    job_close_days INTEGER DEFAULT 30,
    
    -- Draft metadata
    current_step INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for job_drafts updated_at
CREATE TRIGGER update_job_drafts_updated_at 
    BEFORE UPDATE ON job_drafts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();