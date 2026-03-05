const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const applyMigration = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const sqlPath = path.join(__dirname, '../database/migrations/022_add_job_status_fields.sql');
        const sqlFile = fs.readFileSync(sqlPath, 'utf8');

        await client.connect();
        console.log('Connected to the database. Running migration...');

        await client.query(sqlFile);
        console.log('Migration applied successfully.');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        await client.end();
    }
};

applyMigration();
