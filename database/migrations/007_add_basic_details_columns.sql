-- Add Basic Details columns to candidates table

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS roll_no VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS course VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS primary_specialization VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS medical_history TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS disability VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS known_languages TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS dream_company VARCHAR(255);

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_candidates_roll_no ON candidates(roll_no);
CREATE INDEX IF NOT EXISTS idx_candidates_course ON candidates(course);
