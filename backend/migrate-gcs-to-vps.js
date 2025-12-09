const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

// Initialize GCS
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, 'service-account-key.json')
});

const bucket = storage.bucket('fluidjobs-storage');

// Create local directories
const uploadsDir = path.join(__dirname, 'uploads');
const dirs = ['job-descriptions', 'resumes', 'profile-images', 'job-attachments'];

dirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

async function downloadFromGCS() {
  console.log('🚀 Starting GCS to VPS migration...\n');

  try {
    // Get all files from bucket
    const [files] = await bucket.getFiles();
    
    console.log(`📦 Found ${files.length} files in GCS bucket\n`);

    let downloaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const fileName = file.name;
        console.log(`⬇️  Downloading: ${fileName}`);

        // Skip directory entries
        if (fileName.endsWith('/')) {
          console.log(`   ⏭️  Skipping directory: ${fileName}`);
          continue;
        }

        // Determine local path based on GCS path
        let localPath;
        if (fileName.startsWith('job-descriptions/')) {
          localPath = path.join(uploadsDir, fileName);
        } else if (fileName.startsWith('resume/')) {
          localPath = path.join(uploadsDir, 'resumes', path.basename(fileName));
        } else if (fileName.startsWith('profile images/')) {
          localPath = path.join(uploadsDir, 'profile-images', path.basename(fileName));
        } else {
          localPath = path.join(uploadsDir, 'job-attachments', path.basename(fileName));
        }

        // Create directory if needed
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Download file
        await file.download({ destination: localPath });
        console.log(`   ✅ Saved to: ${localPath}`);
        downloaded++;

      } catch (error) {
        console.error(`   ❌ Failed: ${file.name} - ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Downloaded: ${downloaded} files`);
    console.log(`   ❌ Failed: ${failed} files`);

    return { downloaded, failed, total: files.length };

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function updateDatabaseUrls() {
  console.log('\n🔄 Updating database URLs...\n');

  try {
    // Update jobs_enhanced table
    const jobsResult = await pool.query(`
      UPDATE jobs_enhanced 
      SET jd_pdf_url = REPLACE(jd_pdf_url, 
        'https://storage.googleapis.com/fluidjobs-storage/job-descriptions/', 
        '/uploads/job-descriptions/')
      WHERE jd_pdf_url LIKE 'https://storage.googleapis.com/fluidjobs-storage/%'
      RETURNING id;
    `);

    console.log(`✅ Updated ${jobsResult.rowCount} job records`);

    // Update job_attachments table (skip if table doesn't exist or has different schema)
    let attachmentsResult = { rowCount: 0 };
    try {
      attachmentsResult = await pool.query(`
        UPDATE job_attachments 
        SET file_name = REPLACE(
          REPLACE(
            REPLACE(file_name, 
              'https://storage.googleapis.com/fluidjobs-storage/job-descriptions/', 
              '/uploads/job-descriptions/'),
            'https://storage.googleapis.com/fluidjobs-storage/resume/', 
            '/uploads/resumes/'),
          'https://storage.googleapis.com/fluidjobs-storage/profile images/', 
          '/uploads/profile-images/')
        WHERE file_name LIKE 'https://storage.googleapis.com/fluidjobs-storage/%'
        RETURNING id;
      `);
    } catch (err) {
      console.log(`⚠️  Skipped job_attachments table: ${err.message}`);
    }

    console.log(`✅ Updated ${attachmentsResult.rowCount} attachment records`);

    // Update candidates table (skip if column doesn't exist)
    let candidatesResult = { rowCount: 0 };
    try {
      candidatesResult = await pool.query(`
        UPDATE candidates 
        SET resume_url = REPLACE(resume_url, 
          'https://storage.googleapis.com/fluidjobs-storage/resume/', 
          '/uploads/resumes/')
        WHERE resume_url LIKE 'https://storage.googleapis.com/fluidjobs-storage/%'
        RETURNING candidate_id;
      `);
      console.log(`✅ Updated ${candidatesResult.rowCount} candidate records`);
    } catch (err) {
      console.log(`⚠️  Skipped candidates table: ${err.message}`);
    }

    // Update users table (skip if column doesn't exist)
    let usersResult = { rowCount: 0 };
    try {
      usersResult = await pool.query(`
        UPDATE users 
        SET profile_image = REPLACE(profile_image, 
          'https://storage.googleapis.com/fluidjobs-storage/profile images/', 
          '/uploads/profile-images/')
        WHERE profile_image LIKE 'https://storage.googleapis.com/fluidjobs-storage/%'
        RETURNING id;
      `);
      console.log(`✅ Updated ${usersResult.rowCount} user records`);
    } catch (err) {
      console.log(`⚠️  Skipped users table: ${err.message}`);
    }

    console.log('\n✅ Database URLs updated successfully!');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    throw error;
  }
}

async function migrate() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   GCS to VPS Migration Script');
    console.log('═══════════════════════════════════════════════════\n');

    // Step 1: Download files from GCS
    const result = await downloadFromGCS();

    // Step 2: Update database URLs
    if (result.downloaded > 0) {
      await updateDatabaseUrls();
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   ✅ Migration Complete!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📝 Next steps:');
    console.log('1. Verify files in backend/uploads/ directory');
    console.log('2. Test file access via http://localhost:8000/uploads/...');
    console.log('3. Deploy to VPS and copy uploads/ directory');
    console.log('4. (Optional) Delete GCS bucket to save costs\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
