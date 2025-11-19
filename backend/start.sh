#!/bin/bash

# BS Detector Backend - Quick Start Script

echo "🐝 BS Detector Backend - Quick Start"
echo "===================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Select configuration mode:"
    echo "   1) Unlimited Access (No rate limits)"
    echo "   2) Standard/Free Tier (With rate limits)"
    echo ""
    read -p "Enter choice [1 or 2]: " choice

    if [ "$choice" = "1" ]; then
        echo "🚀 Using unlimited access configuration..."
        cp .env.unlimited .env
        echo "⚡ Unlimited mode - no rate limits!"
    else
        echo "📊 Using standard configuration..."
        cp .env.example .env
        echo "✅ Standard mode with rate limiting"
    fi

    echo ""
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
