require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

async function testBucketAccess() {
  try {
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: '619325207297-compute@developer.gserviceaccount.com',
        private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, '\n'),
      }
    });

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
    
    console.log('Testing bucket access...');
    const [files] = await bucket.getFiles({ maxResults: 10 });
    
    console.log(`Found ${files.length} files in bucket:`);
    files.forEach(file => {
      console.log(`- ${file.name}`);
    });
    
    // Look for candidate-related files
    const candidateFiles = files.filter(file => 
      file.name.toLowerCase().includes('candidate') || 
      file.name.toLowerCase().includes('.csv') ||
      file.name.toLowerCase().includes('list')
    );
    
    if (candidateFiles.length > 0) {
      console.log('\nCandidate-related files found:');
      candidateFiles.forEach(file => console.log(`- ${file.name}`));
    }
    
  } catch (error) {
    console.error('Error accessing bucket:', error.message);
  }
}

testBucketAccess();