@echo off
title SPH DATA Local Server
cd /d "%~dp0"
echo Starting SPH DATA local web server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
