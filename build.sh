#!/bin/bash

# Build script for deployment
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Build completed successfully!"
