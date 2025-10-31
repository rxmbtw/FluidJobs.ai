-- Job attachments table for JD file uploads
CREATE TABLE IF NOT EXISTS job_attachments (
    attachment_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs_enhanced(job_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    attachment_type VARCHAR(50) DEFAULT 'job_description',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_job_attachments_job_id ON job_attachments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_attachments_type ON job_attachments(attachment_type);

-- Add constraint for attachment types
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_attachment_type'
    ) THEN
        ALTER TABLE job_attachments 
        ADD CONSTRAINT chk_attachment_type 
        CHECK (attachment_type IN ('job_description', 'company_brochure', 'additional_document'));
    END IF;
END $$;