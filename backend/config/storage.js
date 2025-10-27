const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Create subdirectories
const profileImagesDir = path.join(uploadsDir, 'profile-images');
const resumesDir = path.join(uploadsDir, 'resumes');

if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

console.log('✅ Local file storage initialized');

// Multer disk storage for local files
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.route.path.includes('profile-image') ? 'profile-images' : 'resumes';
    cb(null, path.join(uploadsDir, folder));
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

// Upload file locally (temporary solution)
async function uploadToLocal(file, folder = 'uploads') {
  try {
    console.log('File uploaded locally:', { folder, filename: file.filename, path: file.path });
    
    // Return the local URL that can be served by Express
    const publicUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${folder}/${file.filename}`;
    console.log('File available at:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Local Upload Error:', error);
    throw error;
  }
}

module.exports = { upload, uploadToLocal };