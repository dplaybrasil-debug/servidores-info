@echo off
chcp 65001 > nul
title Iniciar Ambos os Servidores
echo ====================================================
echo   INICIANDO CENTRAL DE SERVIDORES E EDITOR DE LISTAS
echo ====================================================
echo.
start "Central de Servidores" cmd.exe /c "cd /d C:\Users\dimil\Downloads\Central-de-Servidores && INICIAR_SERVIDOR.bat"
start "Editor de Listas" cmd.exe /c "cd /d C:\Users\dimil\Downloads\Editor-de-Listas && INICIAR.bat"
echo Servidores disparados com sucesso!
