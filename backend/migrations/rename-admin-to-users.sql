-- Migration: Rename admin table to users and admin_id to user_id
-- Date: 2024

BEGIN;

-- Drop old users table if exists (from old schema)
DROP TABLE IF EXISTS users CASCADE;

-- Rename the admin table to users
ALTER TABLE admin RENAME TO users;

-- Rename foreign key columns in other tables
ALTER TABLE jobs_enhanced RENAME COLUMN created_by_admin_id TO created_by_user_id;
ALTER TABLE candidate_restrictions RENAME COLUMN admin_id TO user_id;
ALTER TABLE candidate_unrestrictions RENAME COLUMN admin_id TO user_id;

-- Rename admin_whitelist table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_whitelist') THEN
        ALTER TABLE admin_whitelist RENAME TO user_whitelist;
    END IF;
END $$;

COMMIT;
