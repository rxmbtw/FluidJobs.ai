const axios = require('axios');

async function testSarvam() {
    const SARVAM_API_KEY = 'sk_1ht1ormx_SfNT1gi4PRWNePVKl6Kl6nWD';
    const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

    try {
        console.log("Testing Sarvam API...");
        const response = await axios.post(
            SARVAM_API_URL,
            {
                model: "sarvam-30b", // standard model name?
                messages: [{ role: "user", content: "Say hello world" }],
                temperature: 0.7,
                max_tokens: 50
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SARVAM_API_KEY}`
                }
            }
        );
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Error payload:", e.response ? e.response.data : e.message);
    }
}

testSarvam();
