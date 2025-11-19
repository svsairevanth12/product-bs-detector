#!/bin/bash

# BS Detector Backend - Quick Start Script

echo "🐝 BS Detector Backend - Quick Start"
echo "===================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your POLLINATIONS_API_TOKEN"
    echo "   Get your token at: https://auth.pollinations.ai/"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create logs directory if it doesn't exist
if [ ! -d logs ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
    echo ""
fi

echo "🚀 Starting BS Detector Backend..."
echo "   Health Check: http://localhost:3000/api/health"
echo "   API Docs: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
