const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './service-account-key.json'
});

async function listBucket() {
  try {
    const [files] = await storage.bucket('fluidjobs-storage').getFiles();
    
    console.log('Bucket contents:');
    files.forEach(file => {
      console.log(file.name);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

listBucket();