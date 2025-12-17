-- Migration: Create account_users junction table
-- Purpose: Many-to-many relationship between accounts and users

BEGIN;

CREATE TABLE IF NOT EXISTS account_users (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(account_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_account_users_account_id ON account_users(account_id);
CREATE INDEX idx_account_users_user_id ON account_users(user_id);

COMMIT;
