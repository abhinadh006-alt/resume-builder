# ========================================
# 🧠 Resume Builder Auto Runner (Full Auto ngrok)
# ========================================

# Paths
$frontendPath = "C:\Users\works\resume-builder\frontend"
$backendPath  = "C:\Users\works\resume-builder"
$ngrokPath    = "C:\Users\works\ngrok.exe"   # Your ngrok.exe location
$ngrokPort    = 5000

Write-Host "`n🚀 Starting Resume Builder Automation..." -ForegroundColor Cyan

# --------------------------
# Step 1: Clean old build
# --------------------------
if (Test-Path "$frontendPath\build") {
    Write-Host "🧹 Removing old build folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$frontendPath\build" -ErrorAction SilentlyContinue
} else {
    Write-Host "✅ No old build folder found. Skipping cleanup." -ForegroundColor Green
}

# --------------------------
# Step 2: Rebuild Frontend
# --------------------------
Write-Host "⚙️  Building frontend..." -ForegroundColor Cyan
Set-Location $frontendPath
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors above." -ForegroundColor Red
    exit
}
Write-Host "✅ Frontend build completed successfully!" -ForegroundColor Green

# --------------------------
# Step 3: Restart Backend
# --------------------------
Write-Host "`n🔁 Restarting backend server..." -ForegroundColor Cyan
Set-Location $backendPath

# Stop any previous Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start backend in background
Start-Process powershell -ArgumentList "cd `"$backendPath`"; node server.js" -WindowStyle Minimized
Write-Host "✅ Backend started!" -ForegroundColor Green

# --------------------------
# Step 4: Start ngrok
# --------------------------
if (Test-Path $ngrokPath) {
    Write-Host "`n🌐 Launching ngrok tunnel on port $ngrokPort..." -ForegroundColor Cyan

    # Stop any old ngrok processes
    Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    # Start ngrok silently in background
    Start-Process -FilePath $ngrokPath -ArgumentList "http $ngrokPort --log=stdout > $env:TEMP\ngrok.log" -WindowStyle Minimized
    Start-Sleep -Seconds 5

    # --------------------------
    # Step 5: Get public URL dynamically
    # --------------------------
    try {
        $ngrokApi = "http://127.0.0.1:4040/api/tunnels"
        $response = Invoke-RestMethod -Uri $ngrokApi -UseBasicParsing
        $publicUrl = $response.tunnels[0].public_url

        if ($publicUrl) {
            Write-Host "✅ ngrok tunnel active at: $publicUrl" -ForegroundColor Green
            Start-Process $publicUrl
        } else {
            Write-Host "⚠️ Couldn't detect public URL yet. Check ngrok dashboard." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ ngrok API not ready yet. Try reopening after few seconds." -ForegroundColor Red
    }
} else {
    Write-Host "❌ ngrok.exe not found at $ngrokPath" -ForegroundColor Red
    Write-Host "➡️  Please update 'ngrokPath' variable to your actual ngrok.exe path." -ForegroundColor Yellow
}

Write-Host "`n✨ Done! Your Resume Builder is live and accessible online." -ForegroundColor Green
