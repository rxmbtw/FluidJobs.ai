-- Create job_shortlisted_candidates table
CREATE TABLE IF NOT EXISTS job_shortlisted_candidates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL,
  candidate_id VARCHAR(255) NOT NULL,
  shortlisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, candidate_id)
);

-- Create job_selected_candidates table
CREATE TABLE IF NOT EXISTS job_selected_candidates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL,
  candidate_id VARCHAR(255) NOT NULL,
  selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, candidate_id)
);

-- Create indexes
CREATE INDEX idx_job_shortlisted_job ON job_shortlisted_candidates(job_id);
CREATE INDEX idx_job_shortlisted_candidate ON job_shortlisted_candidates(candidate_id);
CREATE INDEX idx_job_selected_job ON job_selected_candidates(job_id);
CREATE INDEX idx_job_selected_candidate ON job_selected_candidates(candidate_id);

COMMENT ON TABLE job_shortlisted_candidates IS 'Stores shortlisted candidates per job';
COMMENT ON TABLE job_selected_candidates IS 'Stores selected candidates per job';
