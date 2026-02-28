const fs = require('fs');
const pool = require('./config/database');

async function run() {
    const expectedTables = [
        'users', 'jobs', 'candidates', 'applications', 'job_attachments',
        'candidate_restrictions', 'job_shortlisted_candidates', 'job_selected_candidates',
        'resume_forms', 'basic_details', 'contact_details', 'education', 'attachments',
        'family_details', 'professional_experience', 'internships', 'projects',
        'publications', 'seminars_trainings', 'certifications', 'positions_of_responsibility',
        'other_details', 'candidate_references', 'placement_policy', 'job_applications',
        'saved_jobs', 'accounts', 'jobs_enhanced', 'candidate_restriction_approvals',
        'permissions', 'role_permissions', 'user_permissions', 'candidate_stage_history',
        'candidate_audit_status', 'job_activity_log', 'ai_policies'
    ];

    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const actualTables = new Set(res.rows.map(r => r.table_name));

        const missing = expectedTables.filter(t => !actualTables.has(t));

        if (missing.length === 0) {
            console.log('SUCCESS: All 36 expected tables exist in the database.');
            console.log('Total tables in DB: ' + actualTables.size);
        } else {
            console.log('MISSING TABLES: ' + missing.join(', '));
        }
    } catch (e) {
        console.error(e);
    }
    pool.end();
}
run();
