const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

async function setupBucket() {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    console.log(`Creating bucket: ${bucketName}`);
    
    // Create bucket
    const [bucket] = await storage.createBucket(bucketName, {
      location: 'asia-south1',
      storageClass: 'STANDARD'
    });
    
    console.log(`✅ Bucket ${bucketName} created successfully!`);
    
    // Set bucket permissions for public read
    await bucket.makePublic();
    console.log('✅ Bucket made public for file access');
    
    // Test upload
    const testFile = bucket.file('test.txt');
    await testFile.save('Test file content');
    console.log('✅ Test file uploaded successfully');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Bucket already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

setupBucket();