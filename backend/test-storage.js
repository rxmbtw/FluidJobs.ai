const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Initialize Google Cloud Storage with access key
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: 'fluidjobs-storage@fluidjobsai.iam.gserviceaccount.com',
    private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, '\n'),
    type: 'service_account'
  }
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

async function testStorage() {
  try {
    console.log('Testing Google Cloud Storage connection...');
    console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
    console.log('Bucket Name:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
    
    // Test bucket existence
    const [exists] = await bucket.exists();
    if (exists) {
      console.log('✅ Bucket exists and is accessible');
      
      // Test bucket permissions
      try {
        const [files] = await bucket.getFiles({ maxResults: 1 });
        console.log('✅ Can list files in bucket');
        console.log(`Found ${files.length} files (showing max 1)`);
      } catch (error) {
        console.log('⚠️ Cannot list files:', error.message);
      }
      
    } else {
      console.log('❌ Bucket does not exist or is not accessible');
    }
    
  } catch (error) {
    console.error('❌ Storage connection error:', error.message);
    console.error('Full error:', error);
  }
}

testStorage();