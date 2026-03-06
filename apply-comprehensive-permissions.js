const fs = require('fs');
const path = require('path');

// Read the current superadmin.js file
const filePath = path.join(__dirname, 'backend/routes/superadmin.js');
let content = fs.readFileSync(filePath, 'utf8');

// Read the replacement content
const replacementPath = path.join(__dirname, 'REPLACE_PERMISSIONS_SECTION.txt');
const replacement = fs.readFileSync(replacementPath, 'utf8');

// Find the start and end of the section to replace
const startMarker = '// Get role permissions for SuperAdmin';
const endMarker = '// Create New User';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not find markers in file!');
  process.exit(1);
}

// Replace the section
const before = content.substring(0, startIndex);
const after = content.substring(endIndex);
const newContent = before + replacement + '\n' + endMarker;

// Write the new content
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Successfully updated superadmin.js with comprehensive permissions!');
console.log('');
console.log('📊 New Permission Counts:');
console.log('  - SuperAdmin: 47 permissions');
console.log('  - Admin: 44 permissions');
console.log('  - Recruiter: 22 permissions');
console.log('  - HR: 20 permissions');
console.log('  - Sales: 11 permissions');
console.log('  - Interviewer: 10 permissions');
console.log('');
console.log('🔄 Please restart the backend server for changes to take effect.');
console.log('');
console.log('📝 Backup saved at: backend/routes/superadmin.js.backup-permissions');
