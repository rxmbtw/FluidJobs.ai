const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function createSuperAdmin() {
  const email = 'sodhi@fluid.live';
  const password = 'Sodhi@123';
  const name = 'D Sodhi';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS superadmins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await pool.query(
    'INSERT INTO superadmins (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
    [email, hashedPassword, name]
  );
  
  console.log('✅ SuperAdmin created:');
  console.log('   Email:', email);
  console.log('   Password: Sodhi@123');
  
  await pool.end();
}

createSuperAdmin().catch(console.error);
