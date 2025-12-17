-- Migration: Add status column to accounts table
-- Date: 2024

BEGIN;

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

COMMIT;
