const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Use access key from .env
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: `${process.env.GOOGLE_CLOUD_ACCESS_KEY}@${process.env.GOOGLE_CLOUD_PROJECT_ID}.iam.gserviceaccount.com`,
    private_key: process.env.GOOGLE_CLOUD_SECRET.replace(/\\n/g, '\n')
  }
});

async function createBucket() {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    const [bucket] = await storage.createBucket(bucketName, {
      location: 'asia-south1'
    });
    
    console.log(`✅ Bucket ${bucketName} created!`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Bucket already exists');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

createBucket();