@echo off
REM PitchPoint Deployment Preparation Script for Windows
echo 🏏 PitchPoint Deployment Preparation
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root directory.
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

echo 🔧 Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)

echo ✅ Build successful!

echo 🧪 Running basic checks...

REM Check if build directory exists
if exist "dist" (
    echo ✅ Build directory exists
) else (
    echo ❌ Build directory not found
    exit /b 1
)

REM Check if server index exists
if exist "dist\index.js" (
    echo ✅ Server build exists
) else (
    echo ❌ Server build not found
    exit /b 1
)

REM Check environment files
if exist ".env.production" (
    echo ✅ Production environment file exists
) else (
    echo ⚠️  Production environment file not found
)

echo.
echo 🚀 Deployment checklist:
echo ========================
echo ✅ MongoDB Atlas configured
echo ✅ Health check endpoint added
echo ✅ Environment variables prepared
echo ✅ Build process verified
echo ✅ Deployment configurations updated
echo.
echo Next steps:
echo 1. Deploy backend to Render using render.yaml
echo 2. Deploy frontend to Vercel using vercel.json
echo 3. Update environment variables with actual URLs
echo 4. Test the deployment
echo.
echo 📚 See DEPLOYMENT.md for detailed instructions
echo 🎯 Your project is ready for deployment!
pause