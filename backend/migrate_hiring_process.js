const { Pool } = require('pg');
const pool = new Pool({ host: '72.60.103.151', port: 5432, database: 'fluiddb', user: 'fluidadmin', password: 'admin123' });

async function migrate() {
    console.log('Adding hiring_process column to jobs_enhanced...');

    // Add column if not exists
    await pool.query(`
    ALTER TABLE jobs_enhanced 
    ADD COLUMN IF NOT EXISTS hiring_process JSONB DEFAULT '[]'::jsonb
  `);
    console.log('✅ Column added: hiring_process (JSONB)');

    // Also add pipeline_stage_history table for tracking candidate stage moves
    await pool.query(`
    CREATE TABLE IF NOT EXISTS candidate_pipeline_stages (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
      candidate_id VARCHAR(255) NOT NULL,
      current_stage VARCHAR(100) NOT NULL DEFAULT 'Applied',
      stage_history JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_by VARCHAR(255),
      UNIQUE(job_id, candidate_id)
    )
  `);
    console.log('✅ Table created/verified: candidate_pipeline_stages');

    // Add index for faster lookups
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pipeline_job_id ON candidate_pipeline_stages(job_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pipeline_candidate_id ON candidate_pipeline_stages(candidate_id)`);

    // Set default hiring_process for existing jobs
    const defaultStages = JSON.stringify([
        { id: 'screening', name: 'Screening', isMandatory: true, order: 1 },
        { id: 'tech_assess', name: 'Technical Assessment', isMandatory: false, order: 2 },
        { id: 'l1_tech', name: 'L1 Technical', isMandatory: false, order: 3 },
        { id: 'hr_round', name: 'HR Round', isMandatory: true, order: 4 }
    ]);

    await pool.query(`
    UPDATE jobs_enhanced 
    SET hiring_process = $1::jsonb
    WHERE hiring_process = '[]'::jsonb OR hiring_process IS NULL
  `, [defaultStages]);
    console.log('✅ Default hiring_process set for existing jobs');

    // Verify
    const result = await pool.query('SELECT id, title, hiring_process FROM jobs_enhanced ORDER BY id DESC LIMIT 5');
    console.log('Sample jobs with hiring_process:', result.rows);

    await pool.end();
    console.log('✅ Migration complete!');
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
