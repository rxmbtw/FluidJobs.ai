-- Create table for storing pending authentication roles
CREATE TABLE IF NOT EXISTS pending_auth_roles (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_auth_session ON pending_auth_roles(session_id);

-- Auto-cleanup expired entries (optional)
DELETE FROM pending_auth_roles WHERE expires_at < CURRENT_TIMESTAMP;