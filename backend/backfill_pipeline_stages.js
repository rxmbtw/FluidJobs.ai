const pool = require('./config/database');

async function run() {
    // Backfill missing pipeline_stages for all existing job_applications that don't have one
    const result = await pool.query(`
    SELECT ja.job_id, ja.candidate_id, ja.applied_at, ja.status
    FROM job_applications ja
    LEFT JOIN candidate_pipeline_stages cps 
      ON cps.job_id = ja.job_id AND cps.candidate_id = ja.candidate_id
    WHERE cps.candidate_id IS NULL
  `);

    console.log(`Found ${result.rows.length} applications missing pipeline stage records. Backfilling...`);

    for (const app of result.rows) {
        const initHistory = JSON.stringify([{
            fromStage: 'Applied',
            toStage: 'Applied',
            timestamp: app.applied_at ? new Date(app.applied_at).toISOString() : new Date().toISOString(),
            changedBy: 'System',
            reason: 'Backfilled from job_applications'
        }]);

        await pool.query(
            `INSERT INTO candidate_pipeline_stages (job_id, candidate_id, current_stage, stage_history, updated_at)
       VALUES ($1, $2, 'Applied', $3::jsonb, NOW())
       ON CONFLICT (job_id, candidate_id) DO NOTHING`,
            [app.job_id, app.candidate_id, initHistory]
        );
        console.log(`  ✅ Created pipeline stage for candidate ${app.candidate_id} / job ${app.job_id}`);
    }

    console.log('Done!');
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
