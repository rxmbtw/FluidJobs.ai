const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

// Upload file to VPS filesystem
async function uploadToGCS(file, folder = 'uploads') {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Write file if buffer exists (for memory storage), otherwise file already saved by diskStorage
    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    }
    
    const publicUrl = `/uploads/${folder}/${fileName}`;
    console.log('✅ File uploaded to VPS:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ VPS Upload Error:', error);
    throw error;
  }
}

// Upload job description PDF
async function uploadJobPDF(file, jobId, jobTitle) {
  try {
    const fileName = `JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(jobAttachmentsDir, fileName);
    
    // Write file if buffer exists (for memory storage), otherwise file already saved by diskStorage
    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      // If file was saved by multer, move it to correct location with correct name
      fs.renameSync(file.path, filePath);
    }
    
    const publicUrl = `/uploads/job-attachments/${fileName}`;
    console.log('✅ Job PDF uploaded to VPS:', publicUrl);
    return { publicUrl, fileName };
    
  } catch (error) {
    console.error('❌ Job PDF Upload Error:', error);
    throw error;
  }
}

// Upload file locally
async function uploadToLocal(file, folder = 'uploads') {
  try {
    const fs = require('fs').promises;
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    
    await fs.mkdir(uploadDir, { recursive: true });
    
    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    
    await fs.writeFile(filePath, file.buffer);
    
    const publicUrl = `/uploads/${folder}/${fileName}`;
    console.log('✅ File uploaded locally:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Local Upload Error:', error);
    throw error;
  }
}

module.exports = { upload, uploadToGCS, uploadJobPDF, uploadToLocal };