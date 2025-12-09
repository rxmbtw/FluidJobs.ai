-- SuperAdmin table
CREATE TABLE IF NOT EXISTS superadmins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default superadmin
INSERT INTO superadmins (email, password_hash, name) 
VALUES ('sodhi@fluid.live', '$2b$10$YourHashedPasswordHere', 'D Sodhi')
ON CONFLICT (email) DO NOTHING;
