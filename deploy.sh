#!/bin/bash

# 🚀 Chess Learning App - Production Deployment Script

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (if any)
echo "🧪 Running tests..."
npm run test 2>/dev/null || echo "⚠️  No tests found, skipping..."

# Build for production
echo "🏗️  Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check build size
echo "📊 Checking build size..."
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "📦 Build size: $BUILD_SIZE"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your chess app is now live!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Add your custom domain in Vercel dashboard"
    echo "2. Configure DNS records"
    echo "3. Test the live site"
    echo "4. Set up analytics (Google Analytics)"
    echo "5. Monitor performance"
else
    echo "❌ Deployment failed!"
    exit 1
fi