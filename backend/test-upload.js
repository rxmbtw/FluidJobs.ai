const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    console.log('Testing file upload system...');
    
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const testImageData = Buffer.from('fake-image-data-for-testing');
    fs.writeFileSync(testImagePath, testImageData);
    
    console.log('Created test image file');
    
    // You would need a valid token here for actual testing
    const token = 'your-test-token-here';
    
    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(testImagePath));
    
    console.log('Making upload request...');
    
    const response = await fetch('http://localhost:8000/api/profile/upload-profile-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    // Clean up
    fs.unlinkSync(testImagePath);
    console.log('Cleaned up test file');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Uncomment to run test (need valid token)
// testUpload();

console.log('Upload test script ready. Update with valid token and uncomment testUpload() to run.');