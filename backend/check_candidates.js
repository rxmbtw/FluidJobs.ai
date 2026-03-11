const pool = require('./config/database');
const fs = require('fs');

async function run() {
  // Find the specific candidate FLC9602989613 (Shriram - the one who applied)
  const res = await pool.query(`
    SELECT 
      c.candidate_id, c.full_name, c.email, c.currently_employed,
      c.current_company, c.notice_period, c.current_ctc::text, c.expected_ctc::text,
      c.last_company, c.mode_of_job, c.gender, c.marital_status, c.city,
      ja.resume_path, ja.applied_at, ja.status, ja.application_id,
      cps.current_stage, cps.job_id as pipeline_job_id
    FROM candidates c
    LEFT JOIN job_applications ja ON ja.candidate_id = c.candidate_id
    LEFT JOIN candidate_pipeline_stages cps ON cps.candidate_id = c.candidate_id
    WHERE c.candidate_id LIKE 'FLC%'
    ORDER BY c.created_at DESC
    LIMIT 10
  `);

  // Also check uploads directory
  let uploadFiles = [];
  try {
    uploadFiles = fs.readdirSync('./uploads/applications');
  } catch (e) {
    uploadFiles = ['Directory not found: ' + e.message];
  }

  fs.writeFileSync('flc_candidates.json', JSON.stringify({ candidates: res.rows, uploadFiles }, null, 2));
  console.log('Done. Written to flc_candidates.json');
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
