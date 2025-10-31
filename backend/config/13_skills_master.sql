-- Standardized skills database table
CREATE TABLE IF NOT EXISTS skills_master (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_master_name ON skills_master(skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_master_category ON skills_master(category);
CREATE INDEX IF NOT EXISTS idx_skills_master_active ON skills_master(is_active);

-- Add constraints for category values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_skill_category'
    ) THEN
        ALTER TABLE skills_master 
        ADD CONSTRAINT chk_skill_category 
        CHECK (category IN ('technical', 'soft', 'domain'));
    END IF;
END $$;