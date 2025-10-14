@echo off
echo Building PrismFlow Browser without code signing...

REM Clear problematic cache
rd /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>NUL

REM Set environment variables to skip code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=""
set WIN_CSC_KEY_PASSWORD=""

REM Build for Windows only (skip macOS files that cause symlink issues)
npm run build-win -- --win.forceCodeSigning=false

echo.
echo Build complete! Check the dist folder for installers.
pause