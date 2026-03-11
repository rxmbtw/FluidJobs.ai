const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const res = await axios.post('http://localhost:8000/api/ai/chat', {
            messages: [
                { role: 'user', content: 'hey' },
                { role: 'assistant', content: 'Hello! How can I help you with the FluidJobs platform today?' },
                { role: 'user', content: 'how to create a job opening' }
            ]
        });
        console.log(res.data);
    } catch (error) {
        if (error.response && error.response.data && error.response.data.details) {
            fs.writeFileSync('error.txt', JSON.stringify(error.response.data.details, null, 2));
            console.log("Wrote error.txt with details");
        } else {
            console.log("No details found", error.message);
        }
    }
}

test();
