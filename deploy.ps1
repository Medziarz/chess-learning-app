# 🚀 Chess Learning App - Production Deployment Script (PowerShell)

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build for production  
Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check build size
Write-Host "📊 Checking build size..." -ForegroundColor Yellow
$buildSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📦 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
npx vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🎉 Your chess app is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Add your custom domain in Vercel dashboard" -ForegroundColor White
    Write-Host "2. Configure DNS records" -ForegroundColor White  
    Write-Host "3. Test the live site" -ForegroundColor White
    Write-Host "4. Set up analytics (Google Analytics)" -ForegroundColor White
    Write-Host "5. Monitor performance" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}