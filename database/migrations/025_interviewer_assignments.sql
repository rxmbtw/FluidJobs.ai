-- Migration: Interviewer Assignments
-- Description: Create table for tracking interviewer assignments per stage and candidate
-- Date: 2026-03-04

CREATE TABLE IF NOT EXISTS interviewer_assignments (
    assignment_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) NOT NULL REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    interviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stage_assignment UNIQUE (candidate_id, stage_name, interviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_interviewer_assig_candidate ON interviewer_assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assig_job ON interviewer_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_assig_stage ON interviewer_assignments(stage_name);
