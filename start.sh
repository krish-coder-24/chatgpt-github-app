#!/bin/bash

# VitalAI Platform Startup Script
echo "🏥 Starting VitalAI Platform..."
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is running (optional)
echo "📊 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Starting development server anyway..."
        echo "   Database features will not work until MongoDB is started."
    fi
else
    echo "⚠️  MongoDB client not found. Please ensure MongoDB is installed and running."
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env
    echo "   Please edit .env file with your configuration"
fi

echo ""
echo "🚀 Starting VitalAI Platform..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both backend and frontend
npm run dev