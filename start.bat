@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  MedNutri — One-Click Launcher (Windows)
REM  Starts both frontend (Next.js :3000) and backend (Streamlit :8501)
REM  in separate, colour-coded terminal windows.
REM
REM  Usage:  Double-click start.bat   OR   run it from a terminal.
REM ═══════════════════════════════════════════════════════════════════════════

setlocal

REM ── Resolve project root (folder where this script lives) ──────────────────
set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "BACKEND=%ROOT%backend"

REM ── Colour codes for the title bar ─────────────────────────────────────────
set "FE_TITLE=MedNutri  FRONTEND  (Next.js : 3000)"
set "BE_TITLE=MedNutri  BACKEND   (Streamlit : 8501)"

echo.
echo  ==========================================
echo   MedNutri Full-Stack Launcher
echo  ==========================================
echo   Frontend  →  http://localhost:3000
echo   Backend   →  http://localhost:8501
echo  ==========================================
echo.

REM ── Check .env.local exists for frontend ───────────────────────────────────
if not exist "%FRONTEND%\.env.local" (
    echo  [WARNING] frontend\.env.local not found!
    echo  Copy frontend\.env.local.example to frontend\.env.local
    echo  and add your OPENAI_API_KEY before proceeding.
    echo.
    pause
)

REM ── Check .env exists for backend ──────────────────────────────────────────
if not exist "%BACKEND%\.env" (
    echo  [WARNING] backend\.env not found!
    echo  Copy backend\.env.example to backend\.env
    echo  and add your OPENAI_API_KEY before proceeding.
    echo.
    pause
)

REM ── Launch Streamlit backend in a new window ────────────────────────────────
echo  Starting Streamlit backend...
start "%BE_TITLE%" /D "%BACKEND%" cmd /k "color 5F && streamlit run app.py --server.port 8501"

REM ── Small delay so backend gets a head start ────────────────────────────────
timeout /t 2 /nobreak >nul

REM ── Launch Next.js frontend in a new window ─────────────────────────────────
echo  Starting Next.js frontend...
start "%FE_TITLE%" /D "%FRONTEND%" cmd /k "color 3F && npm run dev"

REM ── Wait a moment, then open both in the browser ───────────────────────────
timeout /t 5 /nobreak >nul
echo.
echo  Opening browser tabs...
start http://localhost:3000
start http://localhost:8501

echo.
echo  Both servers are running.
echo  Close the two terminal windows to stop the servers.
echo.
pause
endlocal
