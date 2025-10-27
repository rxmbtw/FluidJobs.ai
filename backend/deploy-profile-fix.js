const { fixProfileColumns } = require('./scripts/fix_profile_columns');
const { testProfileFix } = require('./test-profile-fix');

async function deployProfileFix() {
  console.log('🚀 Deploying Profile Persistence Fix...\n');
  
  try {
    // Step 1: Run database migration
    console.log('Step 1: Running database migration...');
    await fixProfileColumns();
    
    // Step 2: Test the fix
    console.log('\nStep 2: Testing the fix...');
    await testProfileFix();
    
    console.log('\n✅ Profile fix deployment completed successfully!');
    console.log('\n📋 Summary of fixes applied:');
    console.log('   • Fixed column name mismatches (phone vs phone_number)');
    console.log('   • Fixed data type issues for CTC fields');
    console.log('   • Added missing columns if needed');
    console.log('   • Prevented Google OAuth from overwriting profile data');
    console.log('   • Added comprehensive error handling');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployProfileFix()
    .then(() => {
      console.log('\n🎉 Deployment completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployProfileFix };