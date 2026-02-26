-- Create remaining resume form section tables

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  institution_name VARCHAR(255),
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  grade VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family details table
CREATE TABLE IF NOT EXISTS family_details (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  guardian_name VARCHAR(255),
  emergency_contact VARCHAR(50),
  relationship VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_form_id)
);

-- Professional experience table
CREATE TABLE IF NOT EXISTS professional_experience (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  employment_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internship table
CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  role VARCHAR(255),
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  project_name VARCHAR(255),
  project_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  technologies_used TEXT,
  description TEXT,
  project_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  title VARCHAR(255),
  publication_type VARCHAR(100),
  publisher VARCHAR(255),
  publication_date DATE,
  authors TEXT,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seminars/Trainings/Workshops table
CREATE TABLE IF NOT EXISTS seminars_trainings (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  title VARCHAR(255),
  event_type VARCHAR(100),
  organizer VARCHAR(255),
  event_date DATE,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  certification_name VARCHAR(255),
  issuing_organization VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(255),
  credential_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions of responsibility table
CREATE TABLE IF NOT EXISTS positions_of_responsibility (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  position_title VARCHAR(255),
  organization VARCHAR(255),
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other details table
CREATE TABLE IF NOT EXISTS other_details (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  hobbies TEXT,
  interests TEXT,
  achievements TEXT,
  additional_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_form_id)
);

-- References table
CREATE TABLE IF NOT EXISTS candidate_references (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  reference_name VARCHAR(255),
  designation VARCHAR(255),
  organization VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  relationship VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placement policy table
CREATE TABLE IF NOT EXISTS placement_policy (
  id SERIAL PRIMARY KEY,
  resume_form_id INTEGER NOT NULL REFERENCES resume_forms(id) ON DELETE CASCADE,
  agreed_to_policy BOOLEAN DEFAULT false,
  policy_version VARCHAR(50),
  agreed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_form_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_resume_form ON education(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_attachments_resume_form ON attachments(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_family_details_resume_form ON family_details(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_professional_experience_resume_form ON professional_experience(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_internships_resume_form ON internships(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_form ON projects(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_publications_resume_form ON publications(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_seminars_trainings_resume_form ON seminars_trainings(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_certifications_resume_form ON certifications(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_positions_resume_form ON positions_of_responsibility(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_other_details_resume_form ON other_details(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_candidate_references_resume_form ON candidate_references(resume_form_id);
CREATE INDEX IF NOT EXISTS idx_placement_policy_resume_form ON placement_policy(resume_form_id);
