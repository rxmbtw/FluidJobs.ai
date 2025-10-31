-- Interview scheduling and management table
CREATE TABLE IF NOT EXISTS interviews (
    interview_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(application_id) ON DELETE CASCADE,
    interview_type VARCHAR(50),
    scheduled_date TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    interviewer_name VARCHAR(255),
    interviewer_email VARCHAR(255),
    meeting_link VARCHAR(500),
    location VARCHAR(500),
    status VARCHAR(50) DEFAULT 'scheduled',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_app_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(scheduled_date);

-- Add constraints for enum values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_interview_type'
    ) THEN
        ALTER TABLE interviews 
        ADD CONSTRAINT chk_interview_type 
        CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_interview_status'
    ) THEN
        ALTER TABLE interviews 
        ADD CONSTRAINT chk_interview_status 
        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled'));
    END IF;
END $$;