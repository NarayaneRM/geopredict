@echo off
setlocal enabledelayedexpansion

if "%1"=="" goto usage
if "%1"=="setup" goto setup
if "%1"=="run" goto run
if "%1"=="run-backend" goto run_backend
if "%1"=="run-frontend" goto run_frontend
if "%1"=="install" goto install
if "%1"=="clean" goto clean

:usage
echo Usage: run.bat [command]
echo Available commands:
echo   setup         - Set up the complete environment (backend and frontend)
echo   run           - Run backend and frontend simultaneously
echo   run-backend   - Run only the backend
echo   run-frontend  - Run only the frontend
echo   install       - Install dependencies only (backend and frontend)
echo   clean         - Clean generated files
goto :eof

:setup
call :install
goto :eof

:install
call :install_backend
call :install_frontend
echo All dependencies have been installed.
goto :eof

:install_backend
echo Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..
goto :eof

:install_frontend
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..
goto :eof

:run
start cmd /c "call %0 run-backend"
start cmd /c "call %0 run-frontend"
goto :eof

:run_backend
echo Starting the backend...
cd backend
call venv\Scripts\activate
python main.py
cd ..
goto :eof

:run_frontend
echo Starting the frontend...
cd frontend
npm start
cd ..
goto :eof

:clean
echo Cleaning generated files...
if exist backend\venv rmdir /s /q backend\venv
if exist frontend\node_modules rmdir /s /q frontend\node_modules
echo Cleanup completed.
goto :eof