#!/bin/bash

echo "🔧 Building Backend..."
cd backend
npm run build || echo "⚠️  Backend build failed, continuing..."

echo "🔧 Building Frontend..."
cd ../frontend
npm run build || echo "⚠️  Frontend build failed"

echo "✅ Build process completed!"
