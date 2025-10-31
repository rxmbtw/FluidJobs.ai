const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

console.log('✅ Google Cloud Storage initialized');

// Multer memory storage for Google Cloud
const multerStorage = multer.memoryStorage();

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

// Upload file to Google Cloud Storage
async function uploadToGCS(file, folder = 'uploads') {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const fileUpload = bucket.file(fileName);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;
        console.log('✅ File uploaded to GCS:', publicUrl);
        resolve(publicUrl);
      });
      stream.end(file.buffer);
    });
    
  } catch (error) {
    console.error('❌ GCS Upload Error:', error);
    throw error;
  }
}

// Upload job description PDF
async function uploadJobPDF(file, jobId, jobTitle) {
  try {
    const fileName = `job-descriptions/JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    const fileUpload = bucket.file(fileName);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
      },
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;
        console.log('✅ Job PDF uploaded to GCS:', publicUrl);
        resolve({ publicUrl, fileName });
      });
      stream.end(file.buffer);
    });
    
  } catch (error) {
    console.error('❌ Job PDF Upload Error:', error);
    throw error;
  }
}

module.exports = { upload, uploadToGCS, uploadJobPDF };