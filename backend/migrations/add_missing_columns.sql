-- Add missing columns to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS joining_date VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leaving_date VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
