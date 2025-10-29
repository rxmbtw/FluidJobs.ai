const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const router = express.Router();

// Configure multer for resume uploads
const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Configure multer for image uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
  }
});

// Initialize Google Cloud Storage (fallback to local if GCS fails)
let storage = null;
try {
  storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: './service-account-key.json'
  });
} catch (error) {
  console.log('GCS not configured, using local storage');
}

// Upload resume endpoint
router.post('/resume', uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `resume/${Date.now()}-${req.file.originalname}`;
    
    if (storage) {
      // Upload to Google Cloud Storage
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/fluidjobs-storage/${fileName}`;
      
      res.json({
        success: true,
        fileUrl: publicUrl,
        fileName: req.file.originalname
      });
    } else {
      // Fallback to local storage
      const fs = require('fs');
      const localPath = path.join(__dirname, '../uploads/resumes', fileName.split('/')[1]);
      
      fs.writeFileSync(localPath, req.file.buffer);
      
      const localUrl = `${process.env.BACKEND_URL}/uploads/resumes/${fileName.split('/')[1]}`;
      
      res.json({
        success: true,
        fileUrl: localUrl,
        fileName: req.file.originalname
      });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload profile image endpoint
router.post('/profile-image', uploadImage.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `profile images/${Date.now()}-${req.file.originalname}`;
    
    if (storage) {
      // Upload to Google Cloud Storage
      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/fluidjobs-storage/${fileName}`;
      
      res.json({
        success: true,
        fileUrl: publicUrl,
        fileName: req.file.originalname
      });
    } else {
      // Fallback to local storage
      const fs = require('fs');
      const localPath = path.join(__dirname, '../uploads/profile-images', fileName.split('/')[1]);
      
      fs.writeFileSync(localPath, req.file.buffer);
      
      const localUrl = `${process.env.BACKEND_URL}/uploads/profile-images/${fileName.split('/')[1]}`;
      
      res.json({
        success: true,
        fileUrl: localUrl,
        fileName: req.file.originalname
      });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;