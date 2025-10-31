const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

async function makeBucketPublic() {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    const bucket = storage.bucket(bucketName);
    
    // Make bucket publicly readable
    await bucket.makePublic();
    console.log(`✅ Bucket ${bucketName} is now publicly readable`);
    
    // Set CORS policy
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET'],
        origin: ['*'],
        responseHeader: ['Content-Type'],
      },
    ]);
    console.log('✅ CORS policy set');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeBucketPublic();