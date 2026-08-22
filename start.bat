@echo off
setlocal
title Sentrion Launcher

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%sentrion-frontend"
set "BACKEND=%ROOT%backend"
set "PYTHON=C:\Users\ASUS\AppData\Local\Programs\Python\Python313\python.exe"
set "NODE_DIR=C:\Users\ASUS\AppData\Local\Programs\nodejs"
set "NPM=%NODE_DIR%\npm.cmd"
set "PATH=%NODE_DIR%;%PATH%"

echo.
echo ===========================================
echo          SENTRION - Starting up
echo ===========================================

if not exist "%PYTHON%" (
    echo ERROR: Python was not found at:
    echo %PYTHON%
    pause
    exit /b 1
)

if not exist "%NPM%" (
    echo ERROR: Node.js was not found at:
    echo %NODE_DIR%
    pause
    exit /b 1
)

echo Checking frontend dependencies...
if not exist "%FRONTEND%\node_modules" (
    pushd "%FRONTEND%"
    call "%NPM%" install
    if errorlevel 1 (
        popd
        echo ERROR: Frontend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)

echo Checking backend dependencies...
if not exist "%BACKEND%\venv\Scripts\python.exe" (
    "%PYTHON%" -m venv "%BACKEND%\venv"
)

set "VENV_PY=%BACKEND%\venv\Scripts\python.exe"
set "VENV_PIP=%BACKEND%\venv\Scripts\pip.exe"
if not exist "%BACKEND%\venv\Lib\site-packages\fastapi" (
    "%VENV_PIP%" install -r "%BACKEND%\requirements.txt"
    if errorlevel 1 (
        echo ERROR: Backend dependency installation failed.
        pause
        exit /b 1
    )
)

echo Starting backend on http://localhost:8000 ...
start "Sentrion Backend" /D "%BACKEND%" "%VENV_PY%" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo Starting dashboard on http://localhost:3000 ...
start "Sentrion Dashboard" /D "%FRONTEND%" cmd.exe /k call "%NPM%" run dev

echo.
echo The dashboard is starting. Wait 15 seconds, then open:
echo http://localhost:3000
timeout /t 15 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Sentrion is running. Keep the Backend and Dashboard windows open.
echo To test without hardware, double-click simulate.bat and choose an option.
pause
