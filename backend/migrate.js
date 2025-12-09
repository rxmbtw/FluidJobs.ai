#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations() {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

async function runMigration(file) {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', file), 'utf8');
  await pool.query(sql);
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
  console.log(`✅ Executed: ${file}`);
}

async function migrate() {
  try {
    await createMigrationsTable();
    const executed = await getExecutedMigrations();
    const files = fs.readdirSync(path.join(__dirname, 'migrations'))
      .filter(f => f.endsWith('.sql'))
      .sort();

    const pending = files.filter(f => !executed.includes(f));

    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📦 Running ${pending.length} migration(s)...`);
    for (const file of pending) {
      await runMigration(file);
    }
    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
