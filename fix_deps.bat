@echo off
echo 🔧 Quick Fix: Install with legacy peer deps
cd frontend
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force
npm install --legacy-peer-deps
cd ..
echo ✅ Dependencies fixed! Now run start.bat
pause