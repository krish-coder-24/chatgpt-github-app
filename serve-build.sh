#!/bin/bash

# VitalAI - Serve Pre-built Files Script
# This serves the production build without needing to rebuild

echo "🤖 VitalAI - Serving Pre-built Production Files"
echo "==============================================="
echo ""
echo "✅ Using pre-compiled build files"
echo "⚡ No build process needed - instant startup!"
echo ""

# Check if build directory exists
if [ ! -d "client/build" ]; then
    echo "❌ Build directory not found!"
    echo "Please run: git pull origin main"
    exit 1
fi

# Check if serve is installed globally
if ! command -v serve &> /dev/null; then
    echo "📦 Installing 'serve' package globally..."
    npm install -g serve
fi

echo "🚀 Starting VitalAI on http://localhost:3000"
echo "💙 All Baymax features are ready!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Serve the build directory
cd client/build && serve -s . -l 3000