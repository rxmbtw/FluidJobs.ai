const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
require('module').Module._initPaths();

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/database');

async function deleteEmails() {
  try {
    const emails = [
      'shuklashobhit111@gmail.com',
      'shuklashobhit0001@gmail.com'
    ];

    console.log('🔍 Checking for emails in users table...\n');

    for (const email of emails) {
      // Check if email exists
      const checkResult = await pool.query(
        'SELECT id, email, name, role FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (checkResult.rows.length > 0) {
        const user = checkResult.rows[0];
        console.log(`Found: ${user.email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);

        // Delete the user
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
        console.log(`✅ Deleted: ${user.email}\n`);
      } else {
        console.log(`⏭️  Not found: ${email}\n`);
      }
    }

    console.log('✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteEmails();
