-- User activity tracking table
CREATE TABLE IF NOT EXISTS user_activity (
    activity_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    user_type VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_action ON user_activity(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at);

-- Add constraints for enum values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_activity_user_type'
    ) THEN
        ALTER TABLE user_activity 
        ADD CONSTRAINT chk_activity_user_type 
        CHECK (user_type IN ('candidate', 'admin', 'hr'));
    END IF;
END $$;