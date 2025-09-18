#!/bin/bash

# Deployment script for Render
echo "=== BRC Dashboard Deployment Script ==="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Check if we're in the right directory structure
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: frontend or backend directory not found!"
    echo "Current directory structure:"
    find . -maxdepth 2 -type d
    exit 1
fi

# Build frontend
echo "=== Building Frontend ==="
cd frontend
echo "Frontend directory: $(pwd)"
echo "Installing dependencies..."
npm install
echo "Building frontend..."
npm run build

# Verify build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "Error: Frontend build failed - dist directory or index.html not found!"
    echo "Contents of frontend directory:"
    ls -la
    exit 1
fi

echo "Frontend build successful!"
echo "Contents of dist directory:"
ls -la dist/

# Install backend dependencies
echo "=== Installing Backend Dependencies ==="
cd ../backend
echo "Backend directory: $(pwd)"
npm install

echo "=== Deployment Setup Complete ==="
echo "Final directory structure:"
cd ..
find . -name "dist" -type d
find . -name "index.html" -type f
