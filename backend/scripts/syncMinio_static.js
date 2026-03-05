require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const legacyImages = [
    "FLuidJobs AI - Image Deck/Tech/ai-technology-microchip-background-digital-transformation-concept.jpg",
    "FLuidJobs AI - Image Deck/Tech/annie-spratt-QckxruozjRg-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Tech/Custom%20Education%20&%20Training%20Systems%20with%20Python%20Development.jpg",
    "FLuidJobs AI - Image Deck/Tech/Frontend%20vs%20Backend%20What%20Happens%20Behind%20a%20Website.jpg",
    "FLuidJobs AI - Image Deck/Tech/nubelson-fernandes--Xqckh_XVU4-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Tech/patrick-tomasso-fMntI8HAAB8-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Tech/person-front-computer-working-html.jpg",
    "FLuidJobs AI - Image Deck/Tech/representation-user-experience-interface-design.jpg",
    "FLuidJobs AI - Image Deck/Tech/roman-synkevych-E-V6EMtGSUU-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Tech/software-development-6523979_1280.jpg",
    "FLuidJobs AI - Image Deck/Management/business-meeting-office.jpg",
    "FLuidJobs AI - Image Deck/Management/business-people-board-room-meeting.jpg",
    "FLuidJobs AI - Image Deck/Management/close-up-woman-working-laptop.jpg",
    "FLuidJobs AI - Image Deck/Management/closeup-job-applicant-giving-his-resume-job-interview-office.jpg",
    "FLuidJobs AI - Image Deck/Management/Data%20Science%20Meeting.jpg",
    "FLuidJobs AI - Image Deck/Management/hunters-race-MYbhN8KaaEc-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Management/lukas-blazek-mcSDtbWXUZU-unsplash.jpg",
    "FLuidJobs AI - Image Deck/Management/portrait-smiling-woman-startup-office-coding.jpg",
    "FLuidJobs AI - Image Deck/Management/smiley-man-work-holding-laptop-posing.jpg",
    "FLuidJobs AI - Image Deck/Management/woman-retoucher-looking-camera-smiling-sitting-creative-design-media-agency.jpg"
];

async function run() {
    console.log('Injecting known MinIO images to Database...');

    for (const imgPath of legacyImages) {
        // Decoding '%20' so it looks clean in DB 
        const cleanPath = decodeURIComponent(imgPath);

        const parts = cleanPath.split('/');
        let category = 'Uncategorized';
        if (parts.length >= 3) {
            category = parts[1];
        }

        try {
            const { rowCount } = await pool.query('SELECT id FROM job_cover_images WHERE image_url = $1', [cleanPath]);
            if (rowCount === 0) {
                await pool.query(
                    `INSERT INTO job_cover_images (image_url, source, category, tags) VALUES ($1, 'minio', $2, $3)`,
                    [cleanPath, category, []]
                );
                console.log(`Inserted: ${cleanPath}`);
            } else {
                console.log(`Already exists: ${cleanPath}`);
            }
        } catch (e) {
            console.error('DB Error: ', e.message);
        }
    }

    console.log('Done injecting.');
    process.exit(0);
}

run();
