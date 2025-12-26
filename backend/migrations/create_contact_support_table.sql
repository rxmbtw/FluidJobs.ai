-- Create contact_support table
CREATE TABLE IF NOT EXISTS contact_support (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_support_candidate_id ON contact_support(candidate_id);
CREATE INDEX IF NOT EXISTS idx_contact_support_status ON contact_support(status);
CREATE INDEX IF NOT EXISTS idx_contact_support_created_at ON contact_support(created_at);
