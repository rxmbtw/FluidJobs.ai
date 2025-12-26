-- Add college column to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS college VARCHAR(255);
