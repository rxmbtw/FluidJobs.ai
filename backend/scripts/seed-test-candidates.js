/**
 * seed-test-candidates.js
 * Inserts 8 test candidates (A–H) into the DB for pipeline board testing.
 * Run: node backend/scripts/seed-test-candidates.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const JOB_ID = 41; // Software Engineer (published, confirmed exists)

const TEST_CANDIDATES = [
    { name: 'Test User A', email: 'test.user.a@pipeline.test', phone: '9000000001', company: 'ABC Corp', exp: 2, ctc: 500000, exp_ctc: 700000 },
    { name: 'Test User B', email: 'test.user.b@pipeline.test', phone: '9000000002', company: 'XYZ Ltd', exp: 3, ctc: 600000, exp_ctc: 900000 },
    { name: 'Test User C', email: 'test.user.c@pipeline.test', phone: '9000000003', company: 'Acme Inc', exp: 4, ctc: 800000, exp_ctc: 1100000 },
    { name: 'Test User D', email: 'test.user.d@pipeline.test', phone: '9000000004', company: 'Globex', exp: 1, ctc: 300000, exp_ctc: 500000 },
    { name: 'Test User E', email: 'test.user.e@pipeline.test', phone: '9000000005', company: 'Initech', exp: 5, ctc: 1000000, exp_ctc: 1400000 },
    { name: 'Test User F', email: 'test.user.f@pipeline.test', phone: '9000000006', company: 'Umbrella Corp', exp: 3, ctc: 700000, exp_ctc: 1000000 },
    { name: 'Test User G', email: 'test.user.g@pipeline.test', phone: '9000000007', company: 'Stark Industries', exp: 6, ctc: 1200000, exp_ctc: 1600000 },
    { name: 'Test User H', email: 'test.user.h@pipeline.test', phone: '9000000008', company: 'Wayne Enterprises', exp: 2, ctc: 450000, exp_ctc: 650000 },
];

async function run() {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding test candidates...\n');

        // Clean up existing seed candidates (emails ending in @pipeline.test)
        const existingResult = await client.query(
            `SELECT candidate_id FROM candidates WHERE email LIKE '%@pipeline.test'`
        );
        if (existingResult.rows.length > 0) {
            const ids = existingResult.rows.map(r => r.candidate_id);
            console.log(`🧹 Removing ${ids.length} existing seed candidates...`);
            await client.query(`DELETE FROM job_applications WHERE candidate_id = ANY($1)`, [ids]);
            await client.query(`DELETE FROM candidates WHERE candidate_id = ANY($1)`, [ids]);
            console.log('   Done.\n');
        }

        let count = 0;
        for (const c of TEST_CANDIDATES) {
            const id = `SEED${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

            // Insert candidate with correct column names (from 001 schema + migrations)
            await client.query(
                `INSERT INTO candidates (
          candidate_id, full_name, email, phone_number,
          current_company, notice_period, current_ctc, expected_ctc,
          experience_years, work_status, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Active', NOW(), NOW())`,
                [id, c.name, c.email, c.phone, c.company, 'Immediate', c.ctc, c.exp_ctc, c.exp]
            );

            // Insert job application — 'submitted' maps to APPLIED in candidateService
            await client.query(
                `INSERT INTO job_applications (job_id, candidate_id, user_id, status, applied_at)
         VALUES ($1, $2, $2, 'submitted', NOW())`,
                [JOB_ID, id]
            );

            count++;
            console.log(`✅ ${c.name} → ${id}`);
        }

        console.log(`\n🎉 ${count} test candidates seeded for job_id=${JOB_ID}`);
        console.log('   Navigate to: http://localhost:3000/superadmin-dashboard/jobs/job-dashboard/41-software-engineer/hiring-pipeline\n');

        // Show summary
        const rows = await client.query(
            `SELECT c.full_name, c.email, ja.status
       FROM candidates c
       JOIN job_applications ja ON ja.candidate_id = c.candidate_id
       WHERE c.email LIKE '%@pipeline.test'
       ORDER BY c.created_at DESC`
        );
        rows.rows.forEach(r => console.log(`   ${r.full_name.padEnd(14)} | ${r.email.padEnd(35)} | ${r.status}`));

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.detail) console.error('   Detail:', err.detail);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
