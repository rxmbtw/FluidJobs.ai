const pool = require('../config/database');

async function usePublicPDF() {
  try {
    // Use a publicly available PDF for testing
    const publicPDFUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    // Update the existing record
    const result = await pool.query(`
      UPDATE job_attachments 
      SET file_path = $1, original_name = 'JD - Software Engineer (Sample).pdf'
      WHERE job_id = 1 AND attachment_type = 'job_description'
      RETURNING attachment_id;
    `, [publicPDFUrl]);
    
    if (result.rows.length > 0) {
      console.log('✅ Updated existing PDF record');
      console.log('📎 Attachment ID:', result.rows[0].attachment_id);
    } else {
      // Create new record if none exists
      const newResult = await pool.query(`
        INSERT INTO job_attachments (
          job_id, file_name, original_name, file_path, 
          file_type, attachment_type
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING attachment_id;
      `, [
        1,
        'dummy.pdf',
        'JD - Software Engineer (Sample).pdf',
        publicPDFUrl,
        'application/pdf',
        'job_description'
      ]);
      console.log('✅ Created new PDF record');
      console.log('📎 Attachment ID:', newResult.rows[0].attachment_id);
    }
    
    console.log('🌐 PDF URL:', publicPDFUrl);
    console.log('✅ This PDF is publicly accessible and will work for all developers');
    
    // Verify the record
    const verify = await pool.query(`
      SELECT * FROM job_attachments WHERE job_id = 1 AND attachment_type = 'job_description';
    `);
    
    console.log('\n📋 Current Job Attachments:');
    verify.rows.forEach(att => {
      console.log(`  - ${att.original_name}`);
      console.log(`    URL: ${att.file_path}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

usePublicPDF();