require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('minio');
const { Pool } = require('pg');

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || '72.60.103.151',
    port: parseInt(process.env.MINIO_PORT || '9100', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    console.log('Syncing MinIO images to Database...');
    const bucketName = process.env.MINIO_BUCKET || 'fluidai-bucket';
    const prefix = 'FLuidJobs AI - Image Deck/';

    const objectsStream = minioClient.listObjects(bucketName, prefix, true);

    objectsStream.on('data', async (obj) => {
        if (obj.name.endsWith('/')) return;

        const parts = obj.name.split('/');
        let category = 'Uncategorized';
        if (parts.length >= 3) {
            category = parts[1];
        }

        try {
            const { rowCount } = await pool.query('SELECT id FROM job_cover_images WHERE image_url = $1', [obj.name]);
            if (rowCount === 0) {
                await pool.query(
                    `INSERT INTO job_cover_images (image_url, source, category, tags) VALUES ($1, 'minio', $2, $3)`,
                    [obj.name, category, []]
                );
                console.log(`Inserted: ${obj.name}`);
            }
        } catch (e) {
            console.error('DB Error: ', e.message);
        }
    });

    objectsStream.on('error', (err) => {
        console.error('MinIO Error:', err);
    });

    objectsStream.on('end', () => {
        console.log('Stream finished. Giving database queries 3 seconds to complete...');
        setTimeout(() => {
            console.log('Done syncing MinIO.');
            process.exit(0);
        }, 3000);
    });
}

run();
