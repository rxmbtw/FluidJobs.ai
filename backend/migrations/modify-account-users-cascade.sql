-- Migration: Modify account_users to remove CASCADE DELETE on user_id
-- Purpose: Prevent automatic deletion of account assignments when user is deleted

BEGIN;

-- Drop existing foreign key constraint
ALTER TABLE account_users DROP CONSTRAINT account_users_user_id_fkey;

-- Add new foreign key constraint without CASCADE DELETE for user_id
ALTER TABLE account_users 
ADD CONSTRAINT account_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Keep CASCADE DELETE for account_id (if account deleted, remove assignments)
-- This constraint already exists, no change needed

COMMIT;
