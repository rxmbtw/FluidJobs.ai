/**
 * Migration: Normalize legacy stage names in hiring_process JSONB to match pipeline enum.
 * Maps old names → canonical pipeline names (InterviewStage enum values).
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const STAGE_NAME_MAP = {
    'Technical Assessment': 'Assignment',
    'Assignment Result': 'Assignment',
    'L1 Technical Interview': 'L1 Technical',
    'L2 Technical Interview': 'L2 Technical',
    'L3 Technical Interview': 'L3 Technical',
    'L4 Technical Interview': 'L4 Technical',
    'Phone Screening': 'Screening',
    'Application Review': 'CV Shortlist',
    'System Design Round': 'Assignment',
    'Cultural Fit Interview': 'Management Round',
    'Final Interview': 'Management Round',
};

async function run() {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, title, hiring_process FROM jobs_enhanced WHERE hiring_process IS NOT NULL AND hiring_process != '[]'`
        );
        console.log(`Found ${result.rows.length} jobs with hiring_process data.`);

        let updated = 0;
        for (const row of result.rows) {
            let stages = row.hiring_process;
            if (!Array.isArray(stages)) continue;

            let changed = false;
            const normalized = stages.map(stage => {
                const mapped = STAGE_NAME_MAP[stage.name];
                if (mapped && stage.name !== mapped) {
                    console.log(`  Job ${row.id} (${row.title}): "${stage.name}" → "${mapped}"`);
                    changed = true;
                    return { ...stage, name: mapped };
                }
                return stage;
            });

            // Remove duplicate stages after normalization
            const seen = new Set();
            const deduped = normalized.filter(s => {
                if (seen.has(s.name)) return false;
                seen.add(s.name);
                return true;
            });

            if (changed) {
                await client.query(
                    `UPDATE jobs_enhanced SET hiring_process = $1 WHERE id = $2`,
                    [JSON.stringify(deduped), row.id]
                );
                updated++;
                console.log(`  ✅ Updated job ${row.id}: ${deduped.map(s => s.name).join(' → ')}`);
            }
        }
        console.log(`\nDone. Updated ${updated} jobs.`);
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
