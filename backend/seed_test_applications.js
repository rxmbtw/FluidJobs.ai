const { Pool } = require('pg');
const pool = new Pool({ host: '72.60.103.151', port: 5432, database: 'fluiddb', user: 'fluidadmin', password: 'admin123' });

// Test candidates to seed - different candidates for different jobs
const testCandidates = [
    { id: 'TEST001', name: 'Aryan Mehta', email: 'aryan.mehta.test@example.com', phone: '9876543210', experience: 3, company: 'Infosys', salary: 6 },
    { id: 'TEST002', name: 'Priya Sharma', email: 'priya.sharma.test@example.com', phone: '9876543211', experience: 5, company: 'TCS', salary: 10 },
    { id: 'TEST003', name: 'Rohan Patel', email: 'rohan.patel.test@example.com', phone: '9876543212', experience: 2, company: 'Wipro', salary: 5 },
    { id: 'TEST004', name: 'Sneha Gupta', email: 'sneha.gupta.test@example.com', phone: '9876543213', experience: 7, company: 'HCL', salary: 15 },
    { id: 'TEST005', name: 'Vivek Kumar', email: 'vivek.kumar.test@example.com', phone: '9876543214', experience: 4, company: 'Accenture', salary: 9 },
    { id: 'TEST006', name: 'Kavita Nair', email: 'kavita.nair.test@example.com', phone: '9876543215', experience: 6, company: 'Cognizant', salary: 12 },
    { id: 'TEST007', name: 'Raj Thakur', email: 'raj.thakur.test@example.com', phone: '9876543216', experience: 1, company: 'Startup Inc', salary: 4 },
    { id: 'TEST008', name: 'Ananya Singh', email: 'ananya.singh.test@example.com', phone: '9876543217', experience: 8, company: 'Google India', salary: 25 },
];

// Which candidates apply to which jobs, and their pipeline stages
// Jobs: 41 = software Engineer, 42 = Content Analyst, 43 = AI Lead, 44 = DEMO, 45 = QA Engineer
const applications = [
    // Job 41 - software Engineer
    { jobId: 41, candidateId: 'TEST001', stage: 'Screening' },
    { jobId: 41, candidateId: 'TEST002', stage: 'L1 Technical' },
    { jobId: 41, candidateId: 'TEST003', stage: 'Applied' },
    // Job 42 - Content Analyst
    { jobId: 42, candidateId: 'TEST004', stage: 'HR Round' },
    { jobId: 42, candidateId: 'TEST005', stage: 'Applied' },
    // Job 43 - AI Lead
    { jobId: 43, candidateId: 'TEST006', stage: 'Screening' },
    { jobId: 43, candidateId: 'TEST007', stage: 'Technical Assessment' },
    { jobId: 43, candidateId: 'TEST008', stage: 'Selected' },
    // Job 44 - DEMO
    { jobId: 44, candidateId: 'TEST001', stage: 'Applied' },
    { jobId: 44, candidateId: 'TEST004', stage: 'Screening' },
    // Job 45 - QA Engineer
    { jobId: 45, candidateId: 'TEST002', stage: 'HR Round' },
    { jobId: 45, candidateId: 'TEST006', stage: 'Rejected' },
    { jobId: 45, candidateId: 'TEST008', stage: 'Applied' },
];

async function seed() {
    console.log('🌱 Seeding test candidates and applications...\n');

    // 1. Create test candidates (skip if already exist)
    for (const c of testCandidates) {
        const exists = await pool.query('SELECT candidate_id FROM candidates WHERE candidate_id = $1', [c.id]);
        if (exists.rows.length === 0) {
            await pool.query(`
        INSERT INTO candidates (candidate_id, full_name, email, phone_number, experience_years, current_company, current_ctc, expected_ctc, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [c.id, c.name, c.email, c.phone, c.experience, c.company, c.salary * 100000, (c.salary + 2) * 100000]);
            console.log(`✅ Created candidate: ${c.name} (${c.id})`);
        } else {
            console.log(`⏭️  Exists: ${c.name} (${c.id})`);
        }
    }

    console.log('\n📝 Creating job applications...\n');

    // 2. Create job applications and pipeline stage entries
    for (const app of applications) {
        try {
            // Check job status
            const job = await pool.query('SELECT id, status FROM jobs_enhanced WHERE id = $1', [app.jobId]);
            if (job.rows.length === 0) {
                console.log(`⚠️  Job ${app.jobId} not found`);
                continue;
            }

            // Insert job application (allow any status for testing)
            const dupCheck = await pool.query(
                'SELECT application_id FROM job_applications WHERE job_id = $1 AND candidate_id = $2',
                [app.jobId, app.candidateId]
            );

            if (dupCheck.rows.length === 0) {
                await pool.query(
                    `INSERT INTO job_applications (job_id, candidate_id, user_id, status, applied_at)
           VALUES ($1, $2, $2, 'submitted', NOW() - INTERVAL '${Math.floor(Math.random() * 14) + 1} days')`,
                    [app.jobId, app.candidateId]
                );
                console.log(`✅ Applied: ${app.candidateId} → Job ${app.jobId}`);
            } else {
                console.log(`⏭️  Already applied: ${app.candidateId} → Job ${app.jobId}`);
            }

            // Upsert pipeline stage
            const stageHistory = [
                { fromStage: 'Applied', toStage: 'Applied', timestamp: new Date(Date.now() - 14 * 86400000).toISOString(), changedBy: 'System', reason: 'Application submitted' }
            ];

            if (app.stage !== 'Applied') {
                stageHistory.push({
                    fromStage: 'Applied', toStage: app.stage,
                    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
                    changedBy: 'Admin', reason: 'Stage progressed'
                });
            }

            await pool.query(`
        INSERT INTO candidate_pipeline_stages (job_id, candidate_id, current_stage, stage_history, updated_at)
        VALUES ($1, $2, $3, $4::jsonb, NOW())
        ON CONFLICT (job_id, candidate_id) DO UPDATE
          SET current_stage = $3, stage_history = $4::jsonb, updated_at = NOW()
      `, [app.jobId, app.candidateId, app.stage, JSON.stringify(stageHistory)]);

            console.log(`   📊 Stage: ${app.candidateId} → ${app.stage} (Job ${app.jobId})`);
        } catch (err) {
            console.error(`❌ Error for ${app.candidateId} → Job ${app.jobId}:`, err.message);
        }
    }

    // 3. Summary
    console.log('\n✅ Seed complete! Summary:');
    const summary = await pool.query(`
    SELECT j.id, j.title, COUNT(ja.application_id) as applicants
    FROM jobs_enhanced j
    LEFT JOIN job_applications ja ON ja.job_id = j.id
    WHERE j.id BETWEEN 41 AND 45
    GROUP BY j.id, j.title
    ORDER BY j.id
  `);
    summary.rows.forEach(r => console.log(`  Job ${r.id} - ${r.title}: ${r.applicants} applicant(s)`));

    await pool.end();
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1); });
