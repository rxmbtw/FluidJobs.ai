-- Comprehensive Admin/SuperAdmin Database Setup
-- Run this script to ensure all necessary tables exist for admin and superadmin functionality

-- 1. Create accounts table if not exists
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  locations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ensure superadmins table has profile_picture column
ALTER TABLE superadmins ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- 3. Ensure users table has password_hash column for admin users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 4. Create jobs_enhanced table if not exists (enhanced version of jobs)
CREATE TABLE IF NOT EXISTS jobs_enhanced (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  job_type VARCHAR(50),
  salary_range VARCHAR(100),
  experience_level VARCHAR(50),
  jd_pdf_url TEXT,
  job_domain VARCHAR(100),
  mode_of_job VARCHAR(50),
  min_experience INTEGER,
  max_experience INTEGER,
  skills TEXT[],
  min_salary DECIMAL(12,2),
  max_salary DECIMAL(12,2),
  show_salary_to_candidate BOOLEAN DEFAULT true,
  locations TEXT[],
  selected_image TEXT,
  jd_attachment_name TEXT,
  registration_opening_date TIMESTAMP,
  registration_closing_date TIMESTAMP,
  no_of_openings INTEGER DEFAULT 1,
  account_id INTEGER REFERENCES accounts(account_id),
  created_by_user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  approved_at TIMESTAMP,
  is_republish BOOLEAN DEFAULT false,
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create account_users junction table if not exists
CREATE TABLE IF NOT EXISTS account_users (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(account_id, user_id)
);

-- 6. Create audit_logs table if not exists
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

-- 7. Create audit_settings table if not exists
CREATE TABLE IF NOT EXISTS audit_settings (
  id SERIAL PRIMARY KEY,
  retention_days INTEGER DEFAULT 90,
  auto_purge_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create ai_policies table if not exists
CREATE TABLE IF NOT EXISTS ai_policies (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create contact_support table if not exists
CREATE TABLE IF NOT EXISTS contact_support (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create password_reset_codes table if not exists
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create all necessary indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(account_name);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_status ON jobs_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_account ON jobs_enhanced(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_created_by ON jobs_enhanced(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_account_users_account_id ON account_users(account_id);
CREATE INDEX IF NOT EXISTS idx_account_users_user_id ON account_users(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_policies_type ON ai_policies(type);
CREATE INDEX IF NOT EXISTS idx_contact_support_candidate_id ON contact_support(candidate_id);
CREATE INDEX IF NOT EXISTS idx_contact_support_status ON contact_support(status);
CREATE INDEX IF NOT EXISTS idx_contact_support_created_at ON contact_support(created_at);

-- Insert default audit settings if not exists
INSERT INTO audit_settings (retention_days, auto_purge_enabled) 
VALUES (90, true)
ON CONFLICT DO NOTHING;

-- Verify all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'accounts', 'account_users', 'jobs_enhanced', 'superadmins', 
            'audit_logs', 'audit_settings', 'ai_policies', 'contact_support', 
            'password_reset_codes', 'users', 'candidates'
        ) THEN '✓ Required for Admin/SuperAdmin'
        ELSE '- Other table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY 
    CASE WHEN table_name IN (
        'accounts', 'account_users', 'jobs_enhanced', 'superadmins', 
        'audit_logs', 'audit_settings', 'ai_policies', 'contact_support', 
        'password_reset_codes', 'users', 'candidates'
    ) THEN 1 ELSE 2 END,
    table_name;