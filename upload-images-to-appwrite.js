const { Client, Storage, ID, InputFile } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('694e3ccf0014edd1ce85') // Your project ID
    .setKey('standard_970ab45accffb890835b3e39d3f00456fbbb11362e438e07a6e7925377281707cef0aab6342145f1e6f87302d9f534f235d58698d585602cdf96a3ca6ba39659a825385f894039fec8709972cbd6f8a556ea0043e52b3b173b29ac593d3091986dc4f50d472855962034efa2d726c89f925fb23ae8e5d8c064712fe1b33e486d'); // Your secret API key

const storage = new Storage(client);
const bucketId = '694e3cfd003213c820b2';

// Function to upload a single file
async function uploadFile(filePath, fileName, folder) {
    try {
        const file = await storage.createFile(
            bucketId,
            ID.unique(),
            InputFile.fromPath(filePath, fileName),
            [
                // Permissions - adjust as needed
                'read("any")'
            ]
        );
        console.log(`✓ Uploaded: ${folder}/${fileName} - ID: ${file.$id}`);
        return file;
    } catch (error) {
        console.error(`✗ Failed to upload ${fileName}:`, error.message);
        return null;
    }
}

// Function to upload all images from a directory
async function uploadImagesFromFolder(folderPath, folderName) {
    const files = fs.readdirSync(folderPath);
    
    console.log(`\n📁 Uploading from ${folderName}...`);
    
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
            await uploadFile(filePath, file, folderName);
        }
    }
}

// Main function
async function main() {
    const baseFolder = 'D:\\FluidJobs.ai\\FLuidJobs AI - Image Deck';
    
    console.log('🚀 Starting image upload to Appwrite...');
    console.log(`📦 Bucket ID: ${bucketId}\n`);
    
    // Upload Management folder
    await uploadImagesFromFolder(
        path.join(baseFolder, 'Management'),
        'Management'
    );
    
    // Upload Tech folder
    await uploadImagesFromFolder(
        path.join(baseFolder, 'Tech'),
        'Tech'
    );
    
    console.log('\n✅ Upload complete!');
}

main().catch(console.error);
