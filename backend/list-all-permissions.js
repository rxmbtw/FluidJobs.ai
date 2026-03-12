const pool = require('./config/database');

async function listAllPermissions() {
  console.log('\n📋 COMPLETE PERMISSIONS BREAKDOWN\n');
  console.log('='.repeat(80));

  try {
    // Get all roles
    const roles = ['HR', 'Recruiter', 'Sales', 'Interviewer', 'Admin', 'SuperAdmin'];

    for (const role of roles) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎭 ROLE: ${role.toUpperCase()}`);
      console.log('='.repeat(80));

      const perms = await pool.query(`
        SELECT p.id, p.name, p.description
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = $1
        ORDER BY p.name
      `, [role]);

      console.log(`\nTotal Permissions: ${perms.rows.length}\n`);

      perms.rows.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.name}`);
        if (perm.description) {
          console.log(`   📝 ${perm.description}`);
        }
        
        // Add explanation for key permissions
        const explanations = {
          'view_jobs': '👁️  Can view job listings',
          'create_job': '➕ Can create new job postings',
          'edit_job': '✏️  Can edit existing job details',
          'approve_job': '✅ Can approve job edit requests from others',
          'publish_job': '📢 Can publish jobs to make them visible to candidates',
          'delete_job': '🗑️  Can delete job postings',
          'view_candidates': '👥 Can view candidate profiles',
          'create_candidates': '➕ Can add new candidates to the system',
          'edit_candidates': '✏️  Can modify candidate information',
          'manage_candidates': '🔧 Can perform advanced candidate operations',
          'restrict_candidate': '🚫 Can restrict/block candidates',
          'view_dashboard': '📊 Can access the main dashboard',
          'view_analytics': '📈 Can view analytics and reports',
          'view_reports': '📄 Can view detailed reports',
          'export_reports': '💾 Can export reports to files',
          'view_accounts': '🏢 Can view account/company information',
          'manage_accounts': '🏢 Can create/edit accounts',
          'view_users': '👤 Can view user list',
          'create_users': '➕ Can create new users',
          'edit_users': '✏️  Can modify user details',
          'delete_users': '🗑️  Can delete users',
          'manage_roles': '🎭 Can assign/change user roles',
          'view_approvals': '👀 Can view approval requests',
          'approve_requests': '✅ Can approve various requests',
          'view_pipeline': '🔄 Can view recruitment pipeline',
          'edit_pipeline': '✏️  Can modify pipeline stages',
          'manage_interviews': '📅 Can schedule and manage interviews',
          'add_interview_feedback': '💬 Can add feedback after interviews',
          'view_job_analytics': '📊 Can view job-specific analytics',
          'send_invites': '📧 Can send interview/assessment invites',
          'bulk_import': '📥 Can import candidates in bulk',
          'export_candidates': '💾 Can export candidate data',
          'edit_job_settings': '⚙️  Can modify job configuration settings',
          'track_own_approvals': '📋 Can track their own approval requests',
          'manage_candidate_stages': '🔄 Can move candidates through pipeline stages'
        };

        if (explanations[perm.name]) {
          console.log(`   ${explanations[perm.name]}`);
        }
        console.log('');
      });

      // Highlight critical permissions
      const hasEditJob = perms.rows.some(p => p.name === 'edit_job');
      const hasApproveJob = perms.rows.some(p => p.name === 'approve_job');
      const hasCreateJob = perms.rows.some(p => p.name === 'create_job');

      console.log('\n🔑 KEY PERMISSIONS FOR JOB EDITING:');
      console.log(`   create_job: ${hasCreateJob ? '✅ YES' : '❌ NO'}`);
      console.log(`   edit_job: ${hasEditJob ? '✅ YES' : '❌ NO'}`);
      console.log(`   approve_job: ${hasApproveJob ? '✅ YES' : '❌ NO'}`);

      if (role === 'HR' || role === 'Interviewer') {
        if (hasEditJob) {
          console.log(`\n   ⚠️  WARNING: ${role} should NOT have edit_job permission!`);
        } else {
          console.log(`\n   ✅ CORRECT: ${role} cannot edit jobs`);
        }
      }

      if (role === 'Recruiter' || role === 'Sales') {
        if (hasEditJob && !hasApproveJob) {
          console.log(`\n   ✅ CORRECT: ${role} can edit but needs approval`);
        } else if (!hasEditJob) {
          console.log(`\n   ⚠️  WARNING: ${role} should have edit_job permission!`);
        } else if (hasApproveJob) {
          console.log(`\n   ⚠️  WARNING: ${role} should NOT have approve_job permission!`);
        }
      }

      if (role === 'Admin' || role === 'SuperAdmin') {
        if (hasEditJob && hasApproveJob) {
          console.log(`\n   ✅ CORRECT: ${role} can edit and approve directly`);
        } else {
          console.log(`\n   ⚠️  WARNING: ${role} should have both edit_job and approve_job!`);
        }
      }
    }

    // Summary table
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PERMISSION SUMMARY TABLE');
    console.log('='.repeat(80));
    console.log('\n| Role        | create_job | edit_job | approve_job | Workflow                    |');
    console.log('|-------------|------------|----------|-------------|-----------------------------|');

    for (const role of roles) {
      const perms = await pool.query(`
        SELECT p.name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = $1
      `, [role]);

      const hasCreate = perms.rows.some(p => p.name === 'create_job') ? '✅' : '❌';
      const hasEdit = perms.rows.some(p => p.name === 'edit_job') ? '✅' : '❌';
      const hasApprove = perms.rows.some(p => p.name === 'approve_job') ? '✅' : '❌';

      let workflow = '';
      if (role === 'HR' || role === 'Interviewer') {
        workflow = hasEdit === '✅' ? '⚠️  Can edit (WRONG!)' : '✅ Cannot edit (CORRECT)';
      } else if (role === 'Recruiter' || role === 'Sales') {
        if (hasEdit === '✅' && hasApprove === '❌') {
          workflow = '✅ Edit → Needs Approval';
        } else if (hasEdit === '❌') {
          workflow = '⚠️  Cannot edit (WRONG!)';
        } else {
          workflow = '⚠️  Can approve (WRONG!)';
        }
      } else if (role === 'Admin' || role === 'SuperAdmin') {
        if (hasEdit === '✅' && hasApprove === '✅') {
          workflow = '✅ Direct Save + Approve';
        } else {
          workflow = '⚠️  Missing permissions';
        }
      }

      console.log(`| ${role.padEnd(11)} | ${hasCreate.padEnd(10)} | ${hasEdit.padEnd(8)} | ${hasApprove.padEnd(11)} | ${workflow.padEnd(27)} |`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Permission check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

listAllPermissions();
