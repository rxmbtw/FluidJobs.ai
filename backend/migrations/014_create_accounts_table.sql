-- Create accounts table for admin/superadmin management
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  locations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(account_name);

-- Add profile_picture column to superadmins table if not exists
ALTER TABLE superadmins ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Ensure password_hash column exists in users table for admin users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create jobs_enhanced table if not exists (enhanced version of jobs)
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

-- Create indexes for jobs_enhanced
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_status ON jobs_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_account ON jobs_enhanced(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_created_by ON jobs_enhanced(created_by_user_id);