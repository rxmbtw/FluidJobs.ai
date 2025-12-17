-- Migration: Add missing fields to accounts table
BEGIN;

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS locations TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;

COMMIT;
