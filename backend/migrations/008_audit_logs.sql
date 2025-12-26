-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_name VARCHAR(255),
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create audit_settings table for retention configuration
CREATE TABLE IF NOT EXISTS audit_settings (
  id SERIAL PRIMARY KEY,
  retention_days INTEGER DEFAULT 90,
  auto_purge_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO audit_settings (retention_days, auto_purge_enabled) 
VALUES (90, true)
ON CONFLICT DO NOTHING;
