@echo off
cd /d "%~dp0"
title Servidor do Portal
echo ==========================================
echo   INICIANDO SERVIDOR LOCAL (PHP)
echo ==========================================
echo.
echo   Acesse o portal em: http://127.0.0.1:8000/index.html
echo   Acesse o admin em:  http://127.0.0.1:8000/admin.php
echo.
echo ==========================================
start http://127.0.0.1:8000/admin.php
"%~dp0php\php.exe" -S 0.0.0.0:8000 router.php
pause
