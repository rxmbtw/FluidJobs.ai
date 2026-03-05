/**
 * seed-pipeline-10.js
 * Inserts 10 test candidates directly into the DB for pipeline board UI testing.
 * They are distributed across various hiring stages to test the UI cards properly.
 * Run: node backend/scripts/seed-pipeline-10.js
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

const TEST_CANDIDATES = [
    { name: 'Alice Smith', email: 'alice.pipeline@test.com', phone: '9000000101', company: 'Google', exp: 4, ctc: 800000, exp_ctc: 1200000, stage: 'Applied' },
    { name: 'Bob Johnson', email: 'bob.pipeline@test.com', phone: '9000000102', company: 'Meta', exp: 6, ctc: 1400000, exp_ctc: 1800000, stage: 'Screening' },
    { name: 'Charlie Brown', email: 'charlie.pipeline@test.com', phone: '9000000103', company: 'Amazon', exp: 3, ctc: 600000, exp_ctc: 900000, stage: 'CV Shortlist' },
    { name: 'Diana Prince', email: 'diana.pipeline@test.com', phone: '9000000104', company: 'Netflix', exp: 5, ctc: 1200000, exp_ctc: 1500000, stage: 'HM Review' },
    { name: 'Ethan Hunt', email: 'ethan.pipeline@test.com', phone: '9000000105', company: 'Stark Industries', exp: 8, ctc: 1800000, exp_ctc: 2200000, stage: 'Assignment' },
    { name: 'Fiona Gallagher', email: 'fiona.pipeline@test.com', phone: '9000000106', company: 'Apple', exp: 2, ctc: 400000, exp_ctc: 600000, stage: 'L1 Technical' },
    { name: 'George Miller', email: 'george.pipeline@test.com', phone: '9000000107', company: 'Microsoft', exp: 7, ctc: 1600000, exp_ctc: 2000000, stage: 'L2 Technical' },
    { name: 'Hannah Abbott', email: 'hannah.pipeline@test.com', phone: '9000000108', company: 'Tesla', exp: 5, ctc: 1100000, exp_ctc: 1400000, stage: 'HR Round' },
    { name: 'Ian Malcolm', email: 'ian.pipeline@test.com', phone: '9000000109', company: 'InGen', exp: 10, ctc: 2500000, exp_ctc: 3000000, stage: 'Management Round' },
    { name: 'Julia Roberts', email: 'julia.pipeline@test.com', phone: '9000000110', company: 'Warner Bros', exp: 6, ctc: 1300000, exp_ctc: 1700000, stage: 'Selected' },
];

async function run() {
    const client = await pool.connect();
    try {
        console.log('🌱 Finding the most recent open job...');

        // Find most recent job that isn't closed/draft
        const jobResult = await client.query(`
            SELECT id, title, status FROM jobs_enhanced 
            WHERE status != 'Draft' AND status != 'Closed'
            ORDER BY id DESC LIMIT 1
        `);

        if (jobResult.rows.length === 0) {
            console.error('❌ No valid open jobs found to seed candidates into!');
            return;
        }

        const JOB_ID = jobResult.rows[0].id;
        const JOB_TITLE = jobResult.rows[0].title;
        console.log(`✅ Selected Job: ${JOB_TITLE} (ID: ${JOB_ID})\n`);

        console.log('🌱 Seeding 10 test pipeline candidates...\n');

        // Clean up existing seed candidates
        const existingResult = await client.query(
            `SELECT candidate_id FROM candidates WHERE email LIKE '%@test.com' AND email LIKE '%.pipeline%'`
        );
        if (existingResult.rows.length > 0) {
            const ids = existingResult.rows.map(r => r.candidate_id);
            console.log(`🧹 Removing ${ids.length} existing pipeline test candidates...`);
            await client.query(`DELETE FROM job_applications WHERE candidate_id = ANY($1)`, [ids]);
            await client.query(`DELETE FROM candidates WHERE candidate_id = ANY($1)`, [ids]);
            console.log('   Done.\n');
        }

        let count = 0;
        for (const c of TEST_CANDIDATES) {
            const id = `PIPELINE${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

            // Insert candidate
            await client.query(
                `INSERT INTO candidates (
                  candidate_id, full_name, email, phone_number,
                  current_company, notice_period, current_ctc, expected_ctc,
                  experience_years, work_status, created_at, updated_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Active', NOW() - INTERVAL '3 days', NOW())`,
                [id, c.name, c.email, c.phone, c.company, 'Immediate', c.ctc, c.exp_ctc, c.exp]
            );

            // Insert job application mapped to a specific pipeline stage
            await client.query(
                `INSERT INTO job_applications (job_id, candidate_id, user_id, status, applied_at)
                 VALUES ($1, $2, $2, $3, NOW() - INTERVAL '3 days')`,
                [JOB_ID, id, c.stage]
            );

            count++;
            console.log(`✅ ${c.name.padEnd(16)} → ${c.stage.padEnd(20)} [${id}]`);
        }

        console.log(`\n🎉 ${count} test candidates successfully seeded across the pipeline for job_id=${JOB_ID}!`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.detail) console.error('   Detail:', err.detail);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
