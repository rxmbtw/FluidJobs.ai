#!/bin/bash

echo "🔧 FluidJobs.ai Quick Fix Script"
echo ""

echo "📋 Checking environment files..."

# Check and create backend .env file
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.template" ]; then
        echo "❌ Backend .env missing - copying template"
        cp "backend/.env.template" "backend/.env"
    else
        echo "⚠️  Backend .env.template not found - creating basic .env"
        touch "backend/.env"
    fi
else
    echo "✅ Backend .env exists"
fi

# Check and create frontend .env file
if [ ! -f "FluidJobs.ai/.env" ]; then
    if [ -f "FluidJobs.ai/.env.template" ]; then
        echo "❌ Frontend .env missing - copying template"
        cp "FluidJobs.ai/.env.template" "FluidJobs.ai/.env"
    else
        echo "⚠️  Frontend .env.template not found - creating basic .env"
        touch "FluidJobs.ai/.env"
    fi
else
    echo "✅ Frontend .env exists"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd FluidJobs.ai
npm install
cd ..

echo ""
echo "🗄️ Testing database connection..."
cd backend
if [ -f "../debug-db-test.js" ]; then
    node ../debug-db-test.js
else
    echo "⚠️  Database test script not found - skipping"
fi
cd ..

echo ""
echo "✅ Quick fix complete!"
echo "📝 Next steps:"
echo "   1. Edit .env files with your actual credentials"
echo "   2. Ensure PostgreSQL is running"
echo "   3. Run: ./start.sh"
echo ""
read -p "Press Enter to continue..."