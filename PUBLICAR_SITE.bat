@echo off
chcp 65001 > nul
title Publicar Site — Central de Servidores

echo.
echo ==========================================
echo   PUBLICANDO SITE NO GITHUB PAGES
echo ==========================================
echo.

:: 1. Gerar data.js atualizado
echo [1/3] Gerando data.js com dados atuais...
.\php\php.exe generate_data.php
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao gerar data.js.
    echo Verifique se o PHP esta instalado em .\php\php.exe
    pause
    exit /b 1
)

echo.

:: 2. Commit no Git
echo [2/3] Fazendo commit no Git...
git add data.js index.html style.css portal.js server.html
git commit -m "chore: publicar atualizacoes do site"
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Nenhuma alteracao nova para commitar. O site ja esta atualizado!
    pause
    exit /b 0
)

echo.

:: 3. Push para o GitHub
echo [3/3] Enviando para o GitHub Pages...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao enviar para o GitHub.
    echo Verifique sua conexao com a internet e as credenciais do Git.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   SITE PUBLICADO COM SUCESSO!
echo ==========================================
echo.
echo   Acesse em: https://central-servidores.com
echo   (aguarde 1 a 5 minutos para atualizar)
echo.
pause
