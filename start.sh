#!/bin/bash

echo "🚀 Starting FluidJobs.ai Application..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the FluidJobs.ai root directory"
    exit 1
fi

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

# Install root dependencies
echo "Installing root dependencies..."
npm install

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
echo "🗄️  Testing database connection..."
cd backend
if [ -f "../debug-db-test.js" ]; then
    node ../debug-db-test.js
else
    echo "⚠️  Database test script not found - skipping"
fi
cd ..

echo ""
echo "🚀 Starting servers..."

# Function to kill processes on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server in background
echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server in background
echo "Starting Frontend Application..."
cd FluidJobs.ai
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting..."
echo "🌐 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID