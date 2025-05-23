#!/bin/bash

# Quick start script for development
echo "?? Starting LAN Chat App development environment..."

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "? Error: Not in project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "?? Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "?? Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start development
echo "?? Starting development servers..."
npm run dev
