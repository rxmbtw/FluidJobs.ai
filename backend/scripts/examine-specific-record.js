const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

async function examineRecord() {
  try {
    console.log('🔍 Examining CSV structure around Aaradhya Agrawal...');
    
    const bucketName = 'fluidjobai';
    const fileName = 'FL_candidates_data - FL_candidates_data.csv (9).csv';
    const localFilePath = path.join(__dirname, 'examine_temp.csv');
    
    await storage.bucket(bucketName).file(fileName).download({
      destination: localFilePath,
    });

    const csvContent = fs.readFileSync(localFilePath, 'utf8');
    const lines = csvContent.split('\n');
    
    console.log('📋 Looking for Aaradhya Agrawal in CSV...');
    
    lines.forEach((line, index) => {
      if (line.includes('Aaradhya Agrawal')) {
        console.log(`\n🎯 Found at line ${index + 1}:`);
        console.log(`Raw line: ${line}`);
        
        const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
        console.log(`\nParsed columns:`);
        columns.forEach((col, i) => {
          console.log(`  [${i}]: "${col}"`);
        });
        
        console.log(`\nExpected mapping:`);
        console.log(`  Name (col 1): "${columns[1]}"`);
        console.log(`  Email (col 3): "${columns[3]}"`);
        
        // Also check surrounding lines
        console.log(`\n📋 Context (lines ${Math.max(0, index-1)} to ${Math.min(lines.length-1, index+1)}):`);
        for (let i = Math.max(0, index-1); i <= Math.min(lines.length-1, index+1); i++) {
          const contextCols = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
          console.log(`  Line ${i+1}: Name="${contextCols[1]}" Email="${contextCols[3]}"`);
        }
      }
    });
    
    fs.unlinkSync(localFilePath);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

examineRecord();