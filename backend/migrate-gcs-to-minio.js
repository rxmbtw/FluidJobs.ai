const { Storage } = require('@google-cloud/storage');
const Minio = require('minio');
const path = require('path');
const https = require('https');

// Disable SSL verification for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// GCS Configuration
const gcs = new Storage({
  keyFilename: path.join(__dirname, 'service-account-key.json')
});
const gcsBucket = gcs.bucket('fluidjobs-storage');

// MinIO Configuration
const minioClient = new Minio.Client({
  endPoint: '72.60.103.151',
  port: 9100,
  useSSL: true,
  accessKey: 'fluidaiadmin',
  secretKey: 'Fluidbucket@123',
  transportAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const minioBucketName = 'fluidai-bucket';

async function migrateGCSToMinio() {
  console.log('🚀 Starting GCS to MinIO migration...\n');

  try {
    // Get all files from GCS
    const [files] = await gcsBucket.getFiles();
    console.log(`📦 Found ${files.length} files in GCS\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        console.log(`⬇️  Downloading: ${file.name}`);
        
        // Download from GCS
        const [fileBuffer] = await file.download();
        
        // Upload to MinIO
        await minioClient.putObject(
          minioBucketName,
          file.name,
          fileBuffer,
          fileBuffer.length,
          {
            'Content-Type': file.metadata.contentType || 'application/octet-stream'
          }
        );
        
        console.log(`✅ Uploaded to MinIO: ${file.name}\n`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${file.name}:`, error.message, '\n');
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Success: ${successCount} files`);
    console.log(`❌ Failed: ${errorCount} files`);
    console.log(`📦 Total: ${files.length} files`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateGCSToMinio();
