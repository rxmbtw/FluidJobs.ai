const fs = require('fs');
const path = require('path');

function analyzeCsv() {
  try {
    console.log('🔍 Analyzing CSV structure...');
    
    const csvPath = path.join(__dirname, '../../FluidJobs.ai/public/FL_candidates_data - FL_candidates_data.csv (9).csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvData.split('\r\n').filter(line => line.trim());
    console.log(`📊 Total lines: ${lines.length}`);
    
    // Analyze first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const fields = lines[i].split(',');
      console.log(`\nLine ${i + 1} (${fields.length} fields):`);
      fields.forEach((field, index) => {
        console.log(`  [${index}]: "${field}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeCsv();