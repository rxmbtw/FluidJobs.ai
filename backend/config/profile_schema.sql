-- Add profile image and document storage columns to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS resume_files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS work_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS notice_period VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_ctc VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS previous_ctc VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS work_mode VARCHAR(50);

-- Create user_files table for file management
CREATE TABLE IF NOT EXISTS user_files (
    file_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    file_category VARCHAR(50) NOT NULL, -- 'profile_image', 'cover_image', 'resume', 'document'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_files_candidate_id ON user_files(candidate_id);
CREATE INDEX IF NOT EXISTS idx_user_files_category ON user_files(file_category);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Add foreign key constraint separately to handle existing data
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_files_candidate_id_fkey'
    ) THEN
        ALTER TABLE user_files 
        ADD CONSTRAINT user_files_candidate_id_fkey 
        FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE;
    END IF;
END $$;