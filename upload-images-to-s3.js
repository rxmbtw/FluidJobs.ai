const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure S3 client for your MinIO/S3 bucket
const s3 = new AWS.S3({
  endpoint: 'https://s3.fluidjobs.ai:9004',
  accessKeyId: 'admin',
  secretAccessKey: 'Fluid@bucket2026',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

const bucketName = 'fluidjobs-images';

// Function to upload a file
async function uploadFile(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${s3Key}`);
    return result;
  } catch (error) {
    console.error(`❌ Error uploading ${s3Key}:`, error.message);
  }
}

// Function to upload all images
async function uploadAllImages() {
  const techFolder = 'FLuidJobs AI - Image Deck/Tech';
  const managementFolder = 'FLuidJobs AI - Image Deck/Management';
  
  // Upload tech images
  if (fs.existsSync(techFolder)) {
    const techFiles = fs.readdirSync(techFolder);
    for (const file of techFiles) {
      if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        const filePath = path.join(techFolder, file);
        const s3Key = `tech/${file}`;
        await uploadFile(filePath, s3Key);
      }
    }
  }
  
  // Upload management images
  if (fs.existsSync(managementFolder)) {
    const mgmtFiles = fs.readdirSync(managementFolder);
    for (const file of mgmtFiles) {
      if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        const filePath = path.join(managementFolder, file);
        const s3Key = `management/${file}`;
        await uploadFile(filePath, s3Key);
      }
    }
  }
  
  console.log('🎉 Upload complete!');
}

// Run the upload
uploadAllImages().catch(console.error);