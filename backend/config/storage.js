const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Minio = require('minio');
const https = require('https');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

const MINIO_BUCKET = 'fluidai-bucket';

// Create uploads directories
const uploadsDir = path.join(__dirname, '../uploads');
const jobAttachmentsDir = path.join(uploadsDir, 'job-attachments');

if (!fs.existsSync(jobAttachmentsDir)) {
  fs.mkdirSync(jobAttachmentsDir, { recursive: true });
}

console.log('✅ VPS filesystem storage initialized');

// Multer disk storage for VPS
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, jobAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs allowed'));
    }
  }
});

// Upload file to MinIO
async function uploadToGCS(file, folder = 'uploads') {
  try {
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const objectName = `${folder}/${fileName}`;

    const fileBuffer = file.buffer || fs.readFileSync(file.path);

    await minioClient.putObject(
      MINIO_BUCKET,
      objectName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': file.mimetype }
    );

    const publicUrl = `https://72.60.103.151:9100/${MINIO_BUCKET}/${objectName}`;
    console.log('✅ File uploaded to MinIO:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ MinIO Upload Error:', error);
    throw error;
  }
}

// Upload job description PDF to MinIO
async function uploadJobPDF(file, jobId, jobTitle) {
  try {
    const fileName = `JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const objectName = `job-descriptions/${fileName}`;

    const fileBuffer = file.buffer || fs.readFileSync(file.path);

    await minioClient.putObject(
      MINIO_BUCKET,
      objectName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': 'application/pdf' }
    );

    const publicUrl = `https://72.60.103.151:9100/${MINIO_BUCKET}/${objectName}`;
    console.log('✅ Job PDF uploaded to MinIO:', publicUrl);
    return { publicUrl, fileName };

  } catch (error) {
    console.error('❌ Job PDF Upload Error:', error);
    throw error;
  }
}

// Upload file to MinIO
async function uploadToLocal(file, folder = 'uploads') {
  try {
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const objectName = `${folder}/${fileName}`;

    const fileBuffer = file.buffer || fs.readFileSync(file.path);

    await minioClient.putObject(
      MINIO_BUCKET,
      objectName,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': file.mimetype }
    );

    const publicUrl = `https://72.60.103.151:9100/${MINIO_BUCKET}/${objectName}`;
    console.log('✅ File uploaded to MinIO:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ MinIO Upload Error:', error);
    throw error;
  }
}

module.exports = { minioClient, MINIO_BUCKET, upload, uploadToGCS, uploadJobPDF, uploadToLocal };