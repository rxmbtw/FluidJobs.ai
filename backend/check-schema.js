const pool = require('./config/database');

async function checkSchema() {
  try {
    console.log('Checking candidates table schema...');
    
    // Check if table exists and get column info
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'candidates' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Candidates table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if we need to add missing columns
    const existingColumns = result.rows.map(row => row.column_name);
    const requiredColumns = [
      'profile_image_url',
      'cover_image_url', 
      'resume_files',
      'documents'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\nMissing columns:', missingColumns);
      console.log('Adding missing columns...');
      
      for (const column of missingColumns) {
        let columnDef = '';
        switch (column) {
          case 'profile_image_url':
          case 'cover_image_url':
            columnDef = 'TEXT';
            break;
          case 'resume_files':
          case 'documents':
            columnDef = 'JSONB DEFAULT \'[]\'::jsonb';
            break;
        }
        
        try {
          await pool.query(`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ${column} ${columnDef}`);
          console.log(`✅ Added column: ${column}`);
        } catch (error) {
          console.error(`❌ Failed to add column ${column}:`, error.message);
        }
      }
    } else {
      console.log('\n✅ All required columns exist');
    }
    
  } catch (error) {
    console.error('Schema check error:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();