const express = require('express');
const https = require('https');
const router = express.Router();

// A robust list of common skills
const ALL_SKILLS = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'TypeScript',
    'HTML', 'CSS', 'React.js', 'Angular', 'Vue.js', 'Svelte', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Elasticsearch', 'Oracle',
    'AWS', 'Azure', 'Google Cloud (GCP)', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD',
    'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analytics', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Git', 'Jira', 'Agile', 'Scrum', 'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch',
    'Digital Marketing', 'SEO', 'SEM', 'Content Writing', 'Copywriting', 'Public Relations',
    'Sales', 'B2B Sales', 'Business Development', 'Account Management', 'Customer Success',
    'Financial Analysis', 'Accounting', 'Bookkeeping', 'Excel', 'Corporate Finance',
    'Project Management', 'Product Management', 'Operations Management', 'Supply Chain Management',
    'Human Resources', 'Recruiting', 'Talent Acquisition', 'Employee Relations',
    'Communication Skills', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management', 'Critical Thinking',
    'React Native', 'Flutter', 'Data Engineering', 'Hadoop', 'Spark', 'Kafka', 'Webpack', 'GraphQL', 'REST API',
    'Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'Network Security', 'Information Security',
    'Blockchain', 'Smart Contracts', 'Solidity', 'Web3', 'Ethereum', 'Bitcoin', 'Cryptocurrency'
];

router.get('/skills', (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        if (!q) {
            return res.json(ALL_SKILLS.slice(0, 15));
        }
        const matches = ALL_SKILLS.filter(skill => skill.toLowerCase().includes(q));
        res.json(matches.slice(0, 15));
    } catch (error) {
        console.error('Error in /api/suggestions/skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

router.get('/locations', (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) return res.json([]);

    // Use Nominatim API for free global location search, restricted to India
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=in`;

    const options = {
        headers: {
            'User-Agent': 'FluidJobs.ai/1.0 (contact@fluidjobs.ai)',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    };

    https.get(url, options, (apiRes) => {
        let rawData = '';
        apiRes.on('data', (chunk) => { rawData += chunk; });
        apiRes.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                if (!Array.isArray(parsedData)) {
                    return res.json([]);
                }

                // Extract display name and format it to "City, State"
                const locations = parsedData.map(loc => {
                    const address = loc.address;
                    if (!address) return loc.display_name;

                    const city = address.city || address.town || address.county || address.state_district || loc.name;
                    const state = address.state;

                    if (city && state && city !== state) {
                        return `${city}, ${state}`;
                    } else if (state) {
                        return state;
                    }
                    return loc.display_name.split(',').slice(0, 2).join(', ');
                }).filter(Boolean);

                // Deduplicate
                const uniqueLocations = [...new Set(locations)];
                res.json(uniqueLocations);
            } catch (e) {
                console.error('Error parsing location data', e);
                res.status(500).json({ error: 'Failed to parse location data' });
            }
        });
    }).on('error', (e) => {
        console.error('Error fetching location data', e);
        res.status(500).json({ error: 'Failed to fetch location data' });
    });
});

module.exports = router;
