-- Application status history table
CREATE TABLE IF NOT EXISTS application_status_history (
    history_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(application_id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(255),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_status_history_app_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_app_status_history_date ON application_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_app_status_history_status ON application_status_history(new_status);