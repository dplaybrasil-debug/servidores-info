@echo off
cd /d "%~dp0"
title Servidor do Portal
echo ==========================================
echo   INICIANDO SERVIDOR LOCAL (PHP)
echo ==========================================
echo.
echo   Acesse o portal em: http://localhost:8000/index.html
echo   Acesse o admin em:  http://localhost:8000/admin.php
echo.
echo ==========================================
"%~dp0php\php.exe" -S 0.0.0.0:8000
pause
