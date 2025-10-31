-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
    log_id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    template_id INTEGER REFERENCES email_templates(template_id),
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- Add constraint for status values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_email_status'
    ) THEN
        ALTER TABLE email_logs 
        ADD CONSTRAINT chk_email_status 
        CHECK (status IN ('pending', 'sent', 'failed', 'bounced'));
    END IF;
END $$;