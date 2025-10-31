-- Get in touch inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    inquiry_id SERIAL PRIMARY KEY,
    inquiry_type VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);

-- Add constraints for enum values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_inquiry_type'
    ) THEN
        ALTER TABLE inquiries 
        ADD CONSTRAINT chk_inquiry_type 
        CHECK (inquiry_type IN ('general', 'partnership', 'support', 'sales'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_inquiry_priority'
    ) THEN
        ALTER TABLE inquiries 
        ADD CONSTRAINT chk_inquiry_priority 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_inquiry_status'
    ) THEN
        ALTER TABLE inquiries 
        ADD CONSTRAINT chk_inquiry_status 
        CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed'));
    END IF;
END $$;