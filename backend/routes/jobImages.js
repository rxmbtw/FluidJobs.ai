const express = require('express');
const router = express.Router();
const { minioClient, MINIO_BUCKET } = require('../config/storage');

/**
 * Get list of job cover images from MinIO bucket
 * Returns categorized images with presigned URLs
 */
router.get('/list', async (req, res) => {
  try {
    const categories = {
      tech: 'FLuidJobs AI - Image Deck/Tech/',
      management: 'FLuidJobs AI - Image Deck/Management/'
    };

    console.log('🔍 Fetching images from MinIO bucket:', MINIO_BUCKET);
    console.log('📁 Tech path:', categories.tech);
    console.log('📁 Management path:', categories.management);

    const result = {
      tech: [],
      management: []
    };

    // Fetch images from each category
    for (const [category, prefix] of Object.entries(categories)) {
      try {
        console.log(`\n🔎 Listing objects with prefix: ${prefix}`);
        const stream = minioClient.listObjects(MINIO_BUCKET, prefix, false);
        
        const images = await new Promise((resolve, reject) => {
          const imageList = [];
          
          stream.on('data', (obj) => {
            console.log(`  📄 Found: ${obj.name}`);
            // Only include image files
            if (obj.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.name)) {
              imageList.push({
                name: obj.name,
                size: obj.size,
                lastModified: obj.lastModified
              });
            }
          });
          
          stream.on('error', (err) => {
            console.error(`❌ Error listing ${category} images:`, err);
            reject(err);
          });
          
          stream.on('end', () => {
            console.log(`  ✅ Found ${imageList.length} images in ${category}`);
            resolve(imageList);
          });
        });

        // Generate presigned URLs for each image (valid for 24 hours)
        for (const image of images) {
          try {
            const presignedUrl = await minioClient.presignedGetObject(
              MINIO_BUCKET,
              image.name,
              24 * 60 * 60 // 24 hours
            );
            
            result[category].push({
              name: image.name.split('/').pop(), // Get filename only
              url: presignedUrl,
              size: image.size,
              lastModified: image.lastModified
            });
          } catch (urlError) {
            console.error(`Error generating presigned URL for ${image.name}:`, urlError);
          }
        }

        console.log(`✅ Fetched ${result[category].length} images from ${category}`);
      } catch (categoryError) {
        console.error(`Error fetching ${category} images:`, categoryError);
        // Continue with other categories even if one fails
      }
    }

    res.json({
      success: true,
      images: result,
      totalCount: result.tech.length + result.management.length
    });

  } catch (error) {
    console.error('Error fetching job images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job images',
      details: error.message
    });
  }
});

/**
 * Get a single presigned URL for a specific image
 */
router.get('/presigned-url', async (req, res) => {
  try {
    const { objectName } = req.query;

    if (!objectName) {
      return res.status(400).json({
        success: false,
        error: 'objectName parameter is required'
      });
    }

    const presignedUrl = await minioClient.presignedGetObject(
      MINIO_BUCKET,
      objectName,
      24 * 60 * 60 // 24 hours
    );

    res.json({
      success: true,
      url: presignedUrl
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate presigned URL',
      details: error.message
    });
  }
});

module.exports = router;
