-- Create AI Policies table
CREATE TABLE IF NOT EXISTS ai_policies (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on type for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_policies_type ON ai_policies(type);