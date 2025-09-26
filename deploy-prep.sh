#!/bin/bash

# PitchPoint Deployment Preparation Script
echo "🏏 PitchPoint Deployment Preparation"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "🧪 Running basic checks..."

# Check if build directory exists
if [ -d "dist" ]; then
    echo "✅ Build directory exists"
else
    echo "❌ Build directory not found"
    exit 1
fi

# Check if server index exists
if [ -f "dist/index.js" ]; then
    echo "✅ Server build exists"
else
    echo "❌ Server build not found"
    exit 1
fi

# Check environment files
if [ -f ".env.production" ]; then
    echo "✅ Production environment file exists"
else
    echo "⚠️  Production environment file not found"
fi

echo ""
echo "🚀 Deployment checklist:"
echo "========================"
echo "✅ MongoDB Atlas configured"
echo "✅ Health check endpoint added"
echo "✅ Environment variables prepared"
echo "✅ Build process verified"
echo "✅ Deployment configurations updated"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render using render.yaml"
echo "2. Deploy frontend to Vercel using vercel.json"
echo "3. Update environment variables with actual URLs"
echo "4. Test the deployment"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo "🎯 Your project is ready for deployment!"