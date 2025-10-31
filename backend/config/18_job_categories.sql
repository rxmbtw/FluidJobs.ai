-- Job categories table for job categorization
CREATE TABLE IF NOT EXISTS job_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id INTEGER REFERENCES job_categories(category_id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_job_categories_name ON job_categories(category_name);
CREATE INDEX IF NOT EXISTS idx_job_categories_parent ON job_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_job_categories_active ON job_categories(is_active);