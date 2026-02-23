const express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const router = express.Router();

// Simple agent to bypass self-signed certificate issues for the VPS
const agent = new https.Agent({
    rejectUnauthorized: false
});

/**
 * Image Proxy Route
 * Fetches objects from the known S3 endpoints to bypass SSL/CORS issues.
 */
router.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const decodedUrl = decodeURIComponent(url);
        const urlObj = new URL(decodedUrl);

        // Security: Only allow specific known domains/IPs
        const allowedDomains = ['72.60.103.151', 's3.fluidjobs.ai'];
        if (!allowedDomains.includes(urlObj.hostname)) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }

        console.log(`[ImageProxy] Fetching via node-fetch: ${decodedUrl}`);

        const response = await fetch(decodedUrl, {
            agent,
            timeout: 10000
        });

        if (!response.ok) {
            console.error(`[ImageProxy] Remote server returned ${response.status}: ${response.statusText}`);
            return res.status(response.status).json({
                error: 'Failed to retrieve image from remote storage',
                status: response.status
            });
        }

        // Set content type and cache headers
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

        // Stream the body to the response
        response.body.pipe(res);

    } catch (error) {
        console.error('[ImageProxy] Fetch Proxy Error:', error.message);
        res.status(500).json({
            error: 'Internal error while proxying image',
            details: error.message
        });
    }
});

module.exports = router;
