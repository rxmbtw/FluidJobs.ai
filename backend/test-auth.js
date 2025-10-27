require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

async function testAuth() {
  console.log('=== Google Cloud Authentication Test ===');
  console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
  console.log('Bucket:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
  console.log('Secret length:', process.env.GOOGLE_CLOUD_SECRET?.length);
  
  try {
    // Method 1: Using credentials object
    console.log('\n--- Testing Method 1: Credentials Object ---');
    const storage1 = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: '619325207297-compute@developer.gserviceaccount.com',
        private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, '\n'),
      }
    });
    
    const bucket1 = storage1.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
    await bucket1.exists();
    console.log('✅ Method 1: Success');
    
  } catch (error) {
    console.log('❌ Method 1 Error:', error.message);
  }
  
  try {
    // Method 2: Using default credentials (if available)
    console.log('\n--- Testing Method 2: Default Credentials ---');
    const storage2 = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    
    const bucket2 = storage2.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
    await bucket2.exists();
    console.log('✅ Method 2: Success');
    
  } catch (error) {
    console.log('❌ Method 2 Error:', error.message);
  }
  
  try {
    // Method 3: Test bucket access
    console.log('\n--- Testing Bucket Access ---');
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: '619325207297-compute@developer.gserviceaccount.com',
        private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, '\n'),
      }
    });
    
    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
    const [exists] = await bucket.exists();
    console.log('Bucket exists:', exists);
    
    if (exists) {
      const [files] = await bucket.getFiles({ maxResults: 5 });
      console.log(`Found ${files.length} files`);
      files.forEach(file => console.log(`- ${file.name}`));
    }
    
  } catch (error) {
    console.log('❌ Bucket Access Error:', error.message);
    console.log('Error code:', error.code);
  }
}

testAuth();