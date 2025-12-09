-- GCP Schema Migration - Match existing GCP structure

-- Drop and recreate candidates table with GCP structure
DROP TABLE IF EXISTS candidates CASCADE;
CREATE TABLE candidates (
  candidate_id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255),
  phone_number VARCHAR(50),
  email VARCHAR(255),
  gender VARCHAR(50),
  marital_status VARCHAR(50),
  current_company VARCHAR(255),
  notice_period VARCHAR(100),
  current_ctc NUMERIC,
  location VARCHAR(255),
  resume_link TEXT,
  currently_employed VARCHAR(50),
  previous_company VARCHAR(255),
  expected_ctc NUMERIC,
  experience_years NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  profile_image_url TEXT,
  cover_image_url TEXT,
  work_status VARCHAR(50),
  last_company VARCHAR(255),
  previous_ctc NUMERIC,
  work_mode VARCHAR(50),
  user_role VARCHAR(50),
  role VARCHAR(50),
  password_hash VARCHAR(255),
  resume_files JSONB,
  city VARCHAR(255)
);

-- Admin tables
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_whitelist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs enhanced table
CREATE TABLE IF NOT EXISTS jobs_enhanced (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  job_type VARCHAR(50),
  experience_level VARCHAR(50),
  jd_pdf_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending auth roles
CREATE TABLE IF NOT EXISTS pending_auth_roles (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_status ON jobs_enhanced(status);
