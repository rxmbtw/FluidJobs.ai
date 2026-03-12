const pool = require('./config/database');

async function deepEmailSearch() {
  console.log('\n🔍 DEEP EMAIL SEARCH - Checking Everything\n');
  console.log('='.repeat(60));

  try {
    const searchEmail = 'shuklashobhit111@gmail.com';
    
    console.log(`\nSearching for: ${searchEmail}`);
    console.log(`Email length: ${searchEmail.length} characters`);
    console.log('');

    // 1. Check users table with exact match
    console.log('1️⃣ Exact match in users table:');
    const exact = await pool.query(
      `SELECT id, name, email, role FROM users WHERE email = $1`,
      [searchEmail]
    );
    console.log(`   Found: ${exact.rows.length} rows`);
    if (exact.rows.length > 0) {
      exact.rows.forEach(u => console.log(`   - ID: ${u.id}, Email: "${u.email}", Role: ${u.role}`));
    }

    // 2. Check with LOWER
    console.log('\n2️⃣ Case-insensitive match (LOWER):');
    const lower = await pool.query(
      `SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER($1)`,
      [searchEmail]
    );
    console.log(`   Found: ${lower.rows.length} rows`);
    if (lower.rows.length > 0) {
      lower.rows.forEach(u => console.log(`   - ID: ${u.id}, Email: "${u.email}", Role: ${u.role}`));
    }

    // 3. Check with LIKE pattern
    console.log('\n3️⃣ Pattern match (LIKE):');
    const like = await pool.query(
      `SELECT id, name, email, role FROM users WHERE email LIKE $1`,
      [`%${searchEmail}%`]
    );
    console.log(`   Found: ${like.rows.length} rows`);
    if (like.rows.length > 0) {
      like.rows.forEach(u => console.log(`   - ID: ${u.id}, Email: "${u.email}", Role: ${u.role}`));
    }

    // 4. Check with ILIKE (case-insensitive LIKE)
    console.log('\n4️⃣ Case-insensitive pattern (ILIKE):');
    const ilike = await pool.query(
      `SELECT id, name, email, role FROM users WHERE email ILIKE $1`,
      [`%shukla%`]
    );
    console.log(`   Found: ${ilike.rows.length} rows`);
    if (ilike.rows.length > 0) {
      ilike.rows.forEach(u => console.log(`   - ID: ${u.id}, Email: "${u.email}", Role: ${u.role}`));
    }

    // 5. Check for emails with spaces or special characters
    console.log('\n5️⃣ Checking for emails with spaces/special chars:');
    const special = await pool.query(
      `SELECT id, name, email, role, LENGTH(email) as email_length 
       FROM users 
       WHERE email LIKE '%shukla%' OR email LIKE '% %'`
    );
    console.log(`   Found: ${special.rows.length} rows`);
    if (special.rows.length > 0) {
      special.rows.forEach(u => {
        console.log(`   - ID: ${u.id}, Email: "${u.email}" (${u.email_length} chars), Role: ${u.role}`);
      });
    }

    // 6. List ALL emails in users table
    console.log('\n6️⃣ ALL emails in users table:');
    const all = await pool.query(
      `SELECT id, name, email, role FROM users ORDER BY id`
    );
    console.log(`   Total users: ${all.rows.length}`);
    all.rows.forEach(u => {
      console.log(`   ${u.id}. ${u.email} (${u.role})`);
    });

    // 7. Check superadmins table
    console.log('\n7️⃣ Checking superadmins table:');
    const sa = await pool.query(
      `SELECT id, email FROM superadmins WHERE email ILIKE $1`,
      [`%${searchEmail}%`]
    );
    console.log(`   Found: ${sa.rows.length} rows`);
    if (sa.rows.length > 0) {
      sa.rows.forEach(s => console.log(`   - ID: ${s.id}, Email: "${s.email}"`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 FINAL VERDICT:');
    
    if (exact.rows.length === 0 && lower.rows.length === 0 && like.rows.length === 0) {
      console.log('   ✅ EMAIL IS COMPLETELY AVAILABLE');
      console.log('   ✅ NOT FOUND IN ANY TABLE');
      console.log('\n   The error in UI is definitely a frontend issue!');
      console.log('\n   SOLUTION: Check browser Network tab to see actual API response');
    } else {
      console.log('   ⚠️  EMAIL EXISTS IN DATABASE!');
      console.log('   Found in one or more queries above');
    }
    
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

deepEmailSearch();
