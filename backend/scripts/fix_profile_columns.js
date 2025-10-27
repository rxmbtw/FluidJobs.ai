const pool = require('../config/database');

async function fixProfileColumns() {
  console.log('🔧 Starting profile columns migration...');
  
  try {
    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE candidates 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS city VARCHAR(255);
    `);
    
    // Update phone_number to phone for consistency
    await pool.query(`
      UPDATE candidates 
      SET phone = COALESCE(phone, phone_number)
      WHERE phone IS NULL AND phone_number IS NOT NULL;
    `);
    
    // Update location to city for consistency  
    await pool.query(`
      UPDATE candidates 
      SET city = COALESCE(city, location)
      WHERE city IS NULL AND location IS NOT NULL;
    `);
    
    // Ensure CTC columns are numeric - handle existing string data
    await pool.query(`
      ALTER TABLE candidates 
      ALTER COLUMN current_ctc TYPE NUMERIC(12,2) USING 
        CASE WHEN current_ctc::text ~ '^[0-9]+\.?[0-9]*$' 
             THEN current_ctc::text::NUMERIC(12,2) 
             ELSE NULL END;
    `);
    
    await pool.query(`
      ALTER TABLE candidates 
      ALTER COLUMN previous_ctc TYPE NUMERIC(12,2) USING 
        CASE WHEN previous_ctc::text ~ '^[0-9]+\.?[0-9]*$' 
             THEN previous_ctc::text::NUMERIC(12,2) 
             ELSE NULL END;
    `);
    
    console.log('✅ Profile columns migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  fixProfileColumns()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixProfileColumns };