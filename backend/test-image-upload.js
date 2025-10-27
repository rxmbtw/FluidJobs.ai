const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('./config/database');

const app = express();
app.use(express.json());

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/test-image', upload.single('profileImage'), async (req, res) => {
  console.log('File received:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file' });
  }
  
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query(
      'UPDATE candidates SET profile_image_url = $1 WHERE candidate_id = $2',
      [fileUrl, 'FLC0000000915']
    );
    
    console.log('Database updated with:', fileUrl);
    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Test server on port 3001'));