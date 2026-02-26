const pool = require('../config/database');

async function createTable() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_invites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Successfully created user_invites table');
    } catch (err) {
        console.error('Error creating user_invites table', err);
    } finally {
        process.exit();
    }
}

createTable();
