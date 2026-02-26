/**
 * Diagnose and clean demo candidates.
 * Shows FK errors + all related tables before deleting.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const KEEP_EMAIL = 'test.e2e.applicant@example.com';

const db = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
    max: 2,
    connectionTimeoutMillis: 15000,
});

async function q(sql, params = []) {
    return (await db.query(sql, params));
}

async function safeDelete(label, sql, params) {
    try {
        const r = await q(sql, params);
        console.log(`  ✅ ${label}: ${r.rowCount} deleted`);
    } catch (e) {
        console.warn(`  ⚠  ${label} FAILED: ${e.message}`);
    }
}

async function main() {
    try {
        // Get demo IDs
        const testRes = await q(`SELECT candidate_id FROM candidates WHERE LOWER(email) = LOWER($1)`, [KEEP_EMAIL]);
        if (testRes.rows.length === 0) {
            console.log('Test candidate not found in DB!');
            await db.end(); return;
        }
        const keepId = testRes.rows[0].candidate_id;
        console.log(`\n✅ Keeping candidate: ${keepId}`);

        const demoRes = await q(`SELECT candidate_id FROM candidates WHERE candidate_id != $1`, [keepId]);
        const demoIds = demoRes.rows.map(r => r.candidate_id);
        console.log(`🗑  Demo candidates to remove: ${demoIds.length}`);

        if (demoIds.length === 0) { console.log('Nothing to remove!'); await db.end(); return; }

        // Show all tables that reference candidates to understand FK issues
        const fkRes = await q(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.key_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
      WHERE ccu.table_name = 'candidates' AND tc.constraint_type = 'FOREIGN KEY'
    `);
        console.log('\n📋 Tables referencing candidates:', fkRes.rows.map(r => `${r.table_name}.${r.column_name}`).join(', ') || 'none found');

        // Delete from all possible referencing tables first (cast to text for safety)
        const tables = [
            ['job_candidate_stages', `DELETE FROM job_candidate_stages       WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['job_applications', `DELETE FROM job_applications            WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['job_candidate_assignments', `DELETE FROM job_candidate_assignments   WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_stage_feedback', `DELETE FROM candidate_stage_feedback    WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['saved_jobs', `DELETE FROM saved_jobs                  WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_profiles', `DELETE FROM candidate_profiles          WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_education', `DELETE FROM candidate_education         WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_experience', `DELETE FROM candidate_experience        WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_skills', `DELETE FROM candidate_skills            WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
            ['candidate_documents', `DELETE FROM candidate_documents         WHERE candidate_id::text = ANY($1::text[])`, [demoIds]],
        ];

        console.log('\nDeleting dependent records:');
        for (const [label, sql, params] of tables) {
            await safeDelete(label, sql, params);
        }

        // Finally delete the candidate records
        await safeDelete('candidates (demo)',
            `DELETE FROM candidates WHERE candidate_id::text = ANY($1::text[])`, [demoIds]
        );

        // Verify
        const remaining = await q(`SELECT candidate_id, full_name, email FROM candidates`);
        console.log('\n📋 Remaining candidates:');
        remaining.rows.forEach(r => console.log(`  ${r.candidate_id} | ${r.full_name} | ${r.email}`));

        const apps = await q(`SELECT application_id, job_id, candidate_id, status FROM job_applications`);
        console.log(`\n📋 Remaining job_applications: ${apps.rows.length}`);
        apps.rows.forEach(r => console.log(`  app#${r.application_id} job:${r.job_id} candidate:${r.candidate_id} status:${r.status}`));

        const stages = await q(`SELECT COUNT(*)::int c FROM job_candidate_stages`).catch(() => ({ rows: [{ c: 'table missing' }] }));
        console.log(`📋 Remaining job_candidate_stages: ${stages.rows[0].c}`);

        console.log('\n🎉 Cleanup done!\n');
    } catch (err) {
        console.error('\n❌ Fatal:', err.message);
    } finally {
        await db.end();
    }
}

main();
