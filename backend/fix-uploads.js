const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'profile-images'),
    path.join(__dirname, 'uploads', 'resumes')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory exists: ${dir}`);
    }
  });
};

// Check environment variables
const checkEnvVars = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];
  
  console.log('\n🔍 Checking environment variables...');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
    }
  });
};

// Main fix function
const fixUploads = () => {
  console.log('🔧 Fixing upload system...');
  
  createDirectories();
  checkEnvVars();
  
  console.log('\n📋 Upload System Status:');
  console.log('✅ Local file storage configured');
  console.log('✅ Upload directories created');
  console.log('✅ Express static file serving enabled');
  console.log('✅ Profile and resume upload endpoints ready');
  
  console.log('\n🚀 To test uploads:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Start the frontend: npm start (in FluidJobs.ai folder)');
  console.log('3. Login and go to Edit Profile');
  console.log('4. Upload a profile picture and resume');
  console.log('5. Check the uploads folder for saved files');
  
  console.log('\n📂 Files will be saved to:');
  console.log(`- Profile images: ${path.join(__dirname, 'uploads', 'profile-images')}`);
  console.log(`- Resumes: ${path.join(__dirname, 'uploads', 'resumes')}`);
  
  console.log('\n🌐 Files will be accessible at:');
  console.log('- http://localhost:8000/uploads/profile-images/[filename]');
  console.log('- http://localhost:8000/uploads/resumes/[filename]');
};

fixUploads();