-- Candidate skills with proficiency table
CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_skill_id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(255) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50),
    years_experience NUMERIC(3,1),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill_id ON candidate_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_proficiency ON candidate_skills(proficiency_level);

-- Add constraint for proficiency levels
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_proficiency_level'
    ) THEN
        ALTER TABLE candidate_skills 
        ADD CONSTRAINT chk_proficiency_level 
        CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
END $$;

-- Ensure unique candidate-skill combination
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uq_candidate_skill'
    ) THEN
        ALTER TABLE candidate_skills 
        ADD CONSTRAINT uq_candidate_skill 
        UNIQUE (candidate_id, skill_id);
    END IF;
END $$;