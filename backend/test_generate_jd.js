const axios = require('axios');

async function testBackend() {
    try {
        console.log("Testing Backend generate-jd endpoint with string locations...");
        const response = await axios.post(
            'http://localhost:8000/api/ai/generate-jd',
            {
                job_title: 'Software Engineer',
                location: 'Remote', // string instead of array
                skills: 'React' // string instead of array
            }
        );
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Backend returned error:", e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
    }
}

testBackend();
