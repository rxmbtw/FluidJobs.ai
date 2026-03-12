-- Add create_jobs permission if it doesn't exist
INSERT IGNORE INTO permissions (name, description, category, visible)
VALUES ('create_jobs', 'Create Jobs', 'jobs', 1);

-- Verify it was added
SELECT * FROM permissions WHERE name = 'create_jobs';
