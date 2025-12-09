#!/bin/bash

# VPS Storage Setup Script
# This script creates the necessary directory structure for file uploads

echo "🚀 Setting up VPS storage directories..."

# Create uploads directory structure
mkdir -p uploads/job-descriptions
mkdir -p uploads/resumes
mkdir -p uploads/profile-images
mkdir -p uploads/job-attachments

# Set proper permissions
chmod -R 755 uploads

echo "✅ Directory structure created:"
echo "   - uploads/job-descriptions/"
echo "   - uploads/resumes/"
echo "   - uploads/profile-images/"
echo "   - uploads/job-attachments/"

echo ""
echo "📝 Next steps:"
echo "1. For local development: Run this script in backend/ directory"
echo "2. For VPS deployment: Set UPLOADS_PATH=/var/www/fluidjobs/uploads in .env"
echo "3. On VPS, run: sudo mkdir -p /var/www/fluidjobs/uploads && sudo chown -R \$USER:www-data /var/www/fluidjobs/uploads"
echo ""
echo "✅ Setup complete!"
