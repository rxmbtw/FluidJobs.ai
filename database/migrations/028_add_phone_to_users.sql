-- Migration 028: Add phone column to users table
-- Date: 2026-03-07

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

COMMENT ON COLUMN users.phone IS 'User phone number (optional)';
