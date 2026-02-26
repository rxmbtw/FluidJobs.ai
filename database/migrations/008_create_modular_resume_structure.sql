-- Create modular resume form structure

-- Main resume forms table
CREATE TABLE IF NOT EXISTS resume_forms (
  id SERIAL PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL REFERENCES candidates(candidate_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id)
);

-- Basic details table
CREATE TABLE IF NOT EXISTS basic_details (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  roll_no VARCHAR(100),
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  course VARCHAR(255),
  primary_specialization VARCHAR(255),
  gender VARCHAR(50),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  marital_status VARCHAR(50),
  medical_history TEXT,
  disability VARCHAR(50),
  known_languages TEXT,
  dream_company VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_form_id)
);

-- Contact details table
CREATE TABLE IF NOT EXISTS contact_details (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  primary_phone_code VARCHAR(50),
  primary_phone VARCHAR(50),
  primary_email VARCHAR(255),
  other_phones JSONB DEFAULT '[]'::jsonb,
  other_emails JSONB DEFAULT '[]'::jsonb,
  web_links JSONB DEFAULT '[]'::jsonb,
  current_address TEXT,
  address_line2 TEXT,
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  permanent_address TEXT,
  permanent_address_line2 TEXT,
  permanent_country VARCHAR(100),
  permanent_state VARCHAR(100),
  permanent_city VARCHAR(100),
  permanent_postal_code VARCHAR(20),
  same_as_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_form_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_forms_candidate ON resume_forms(candidate_id);
CREATE INDEX IF NOT EXISTS idx_basic_details_resume_form ON basic_details(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_contact_details_resume_form ON contact_details(resume_form_id);

-- Remove basic details columns from candidates table (optional - keep for backward compatibility)
-- ALTER TABLE candidates DROP COLUMN IF EXISTS roll_no;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS middle_name;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS last_name;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS course;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS primary_specialization;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS date_of_birth;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS blood_group;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS medical_history;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS disability;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS known_languages;
-- ALTER TABLE candidates DROP COLUMN IF EXISTS dream_company;
