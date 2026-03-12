const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function createUserDirectly() {
  console.log('\n👤 Creating User Directly (Bypassing Frontend)\n');
  console.log('='.repeat(60));

  try {
    const userData = {
      name: 'Shobhit Shukla',
      email: 'shuklashobhit111@gmail.com',
      role: 'Admin',  // Change this to desired role
      phone: '9876543210',
      password: 'Fluid@123'  // Default password
    };

    console.log('\nUser Details:');
    console.log(`  Name: ${userData.name}`);
    console.log(`  Email: ${userData.email}`);
    console.log(`  Role: ${userData.role}`);
    console.log(`  Phone: ${userData.phone}`);
    console.log(`  Password: ${userData.password}`);
    console.log('');

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [userData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists!');
      console.log(`   User ID: ${existingUser.rows[0].id}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, role
    `, [userData.name, userData.email, hashedPassword, userData.role, userData.phone]);

    const newUser = result.rows[0];

    console.log('✅ User created successfully!');
    console.log('');
    console.log('User Details:');
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Role: ${newUser.role}`);
    console.log('');
    console.log('Login Credentials:');
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Password: ${userData.password}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ User creation complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

createUserDirectly();
