-- Add profile_picture column to superadmins table
ALTER TABLE superadmins ADD COLUMN IF NOT EXISTS profile_picture TEXT;
