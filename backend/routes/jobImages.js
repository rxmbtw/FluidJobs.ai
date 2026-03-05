const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const pool = require('../config/database');
const { minioClient, MINIO_BUCKET } = require('../config/storage');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for temp storage before MinIO upload
const upload = multer({
  dest: path.join(__dirname, '../uploads/temp/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../uploads/temp/');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Ensure Unsplash config
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

/**
 * Helper: Generate MinIO Presigned URL
 */
async function getPresignedUrl(objectName) {
  try {
    return await minioClient.presignedGetObject(MINIO_BUCKET, objectName, 24 * 60 * 60);
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return null;
  }
}

/**
 * 1. GET /api/job-images/list
 * Fetch paginated images from internal database
 */
router.get('/list', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    let query = `SELECT * FROM job_cover_images WHERE 1=1`;
    const params = [];
    let paramIdx = 1;

    if (category) {
      query += ` AND category = $${paramIdx++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (category ILIKE $${paramIdx} OR $${paramIdx} = ANY(tags))`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Generate secure URLs
    const images = await Promise.all(result.rows.map(async img => {
      // If it's stored in MinIO, we need a fresh presigned URL. 
      // We assume image_url stores the MinIO object name if source is 'minio' or 'external-imported'/'uploaded'
      // If it's a full URL (legacy), return it directly.
      let finalUrl = img.image_url;
      if (!finalUrl.startsWith('http')) {
        finalUrl = await getPresignedUrl(img.image_url) || img.image_url;
      }
      return {
        ...img,
        secure_url: finalUrl
      };
    }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching job images from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. GET /api/job-images/search-external
 * Search Unsplash API for images
 */
router.get('/search-external', async (req, res) => {
  try {
    const { query, per_page = 20 } = req.query;

    if (!UNSPLASH_ACCESS_KEY) {
      return res.status(503).json({ success: false, error: 'External image search is not configured.' });
    }

    if (!query) {
      return res.json({ success: true, images: [] });
    }

    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, per_page, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });

    const images = response.data.results.map(img => ({
      id: img.id,
      url: img.urls.regular,
      thumbnail: img.urls.small,
      author: img.user.name,
      source: 'unsplash'
    }));

    res.json({ success: true, images });
  } catch (error) {
    console.error('Error searching external images:', error?.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to search external images' });
  }
});

/**
 * 3. POST /api/job-images/import-external
 * Download Unsplash image, push to MinIO, and save to database
 */
router.post('/import-external', authenticateToken, async (req, res) => {
  try {
    const { externalUrl, category, tags } = req.body;

    // Download image from Unsplash to buffer
    const response = await axios.get(externalUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Generate unique name
    const ext = 'jpg';
    const filename = `imported_${crypto.randomBytes(4).toString('hex')}_${Date.now()}.${ext}`;
    const objectName = `FLuidJobs AI - Image Deck/${category || 'Imported'}/${filename}`;

    // Upload to MinIO
    await minioClient.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
      'Content-Type': response.headers['content-type'] || 'image/jpeg'
    });

    // Save to Database
    const dbResult = await pool.query(
      `INSERT INTO job_cover_images (image_url, source, category, tags, uploaded_by) 
       VALUES ($1, 'external-imported', $2, $3, $4) RETURNING *`,
      [objectName, category || 'Imported', tags || [], req.user?.id || null]
    );

    const secureUrl = await getPresignedUrl(objectName);

    res.json({
      success: true,
      image: { ...dbResult.rows[0], secure_url: secureUrl },
      message: 'External image imported successfully'
    });

  } catch (error) {
    console.error('Error importing external image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. POST /api/job-images/upload
 * Admin/Superadmin direct upload
 */
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Only allow Admin/Superadmin
    if (!['Admin', 'SuperAdmin', 'HR'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to upload images' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const { category, tags } = req.body;
    let parsedTags = [];
    try { parsedTags = tags ? JSON.parse(tags) : []; } catch (e) { }

    const filename = `uploaded_${crypto.randomBytes(4).toString('hex')}_${Date.now()}${path.extname(file.originalname)}`;
    const objectName = `FLuidJobs AI - Image Deck/${category || 'Custom'}/${filename}`;

    // Upload to MinIO
    await minioClient.fPutObject(MINIO_BUCKET, objectName, file.path, {
      'Content-Type': file.mimetype
    });

    // Delete temp file
    fs.unlinkSync(file.path);

    // Save to DB
    const dbResult = await pool.query(
      `INSERT INTO job_cover_images (image_url, source, category, tags, uploaded_by) 
       VALUES ($1, 'uploaded', $2, $3, $4) RETURNING *`,
      [objectName, category || 'Custom', parsedTags, req.user?.id]
    );

    const secureUrl = await getPresignedUrl(objectName);

    res.json({
      success: true,
      image: { ...dbResult.rows[0], secure_url: secureUrl },
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Legacy Support: Get a single presigned URL for a specific image
 */
router.get('/presigned-url', async (req, res) => {
  try {
    const { objectName } = req.query;
    if (!objectName) {
      return res.status(400).json({ success: false, error: 'objectName is required' });
    }
    const url = await getPresignedUrl(objectName);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
