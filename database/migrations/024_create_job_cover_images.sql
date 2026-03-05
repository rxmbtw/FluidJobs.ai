-- Create job_cover_images table
CREATE TABLE IF NOT EXISTS job_cover_images (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('minio', 'external-imported', 'uploaded')),
  category VARCHAR(100),
  tags TEXT[],
  is_used BOOLEAN DEFAULT false,
  used_count INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add cover_image_id to jobs_enhanced table
ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS cover_image_id INTEGER REFERENCES job_cover_images(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_cover_images_source ON job_cover_images(source);
CREATE INDEX IF NOT EXISTS idx_job_cover_images_category ON job_cover_images(category);
CREATE INDEX IF NOT EXISTS idx_job_cover_images_is_used ON job_cover_images(is_used);
