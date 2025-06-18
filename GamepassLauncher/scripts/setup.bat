@echo off
setlocal enabledelayedexpansion

echo 🎮 Configurando GamepassLauncher...

:: Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale Node.js 16+ primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar versão do Node.js
for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("!NODE_VERSION!") do set MAJOR_VERSION=%%i

if !MAJOR_VERSION! lss 16 (
    echo ❌ Node.js versão 16+ é necessário. Versão atual: !NODE_VERSION!
    pause
    exit /b 1
)

echo ✅ Node.js !NODE_VERSION! detectado

:: Instalar dependências
echo 📦 Instalando dependências...
call npm install

if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo ✅ Dependências instaladas com sucesso

:: Criar diretórios necessários
echo 📁 Criando estrutura de diretórios...
if not exist "downloads" mkdir downloads
if not exist "emulators" mkdir emulators
if not exist "configs" mkdir configs
if not exist "roms" mkdir roms
if not exist "saves" mkdir saves

echo ✅ Diretórios criados

:: Fazer build do projeto
echo 🔨 Fazendo build do projeto...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no build do projeto
    pause
    exit /b 1
)

echo ✅ Build concluído com sucesso

:: Configurações iniciais
echo ⚙️ Aplicando configurações iniciais...

:: Criar arquivo de configuração se não existir
if not exist "configs\app-config.json" (
    echo { > configs\app-config.json
    echo   "version": "1.0.0", >> configs\app-config.json
    echo   "theme": "xbox", >> configs\app-config.json
    echo   "soundsEnabled": true, >> configs\app-config.json
    echo   "downloadPath": "./downloads", >> configs\app-config.json
    echo   "yuzuPath": "./emulators/yuzu", >> configs\app-config.json
    echo   "autoUpdate": true, >> configs\app-config.json
    echo   "gamepadEnabled": true, >> configs\app-config.json
    echo   "lastUpdateCheck": "%date:~-4,4%-%date:~-10,2%-%date:~-7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z" >> configs\app-config.json
    echo } >> configs\app-config.json
    echo ✅ Arquivo de configuração criado
)

echo.
echo 🎉 Setup concluído com sucesso!
echo.
echo 📖 Comandos disponíveis:
echo   npm run dev        - Executar em modo desenvolvimento
echo   npm start          - Executar aplicação
echo   npm run build      - Fazer build da aplicação
echo   npm run electron-pack - Empacotar para distribuição
echo.
echo 🚀 Para iniciar o GamepassLauncher, execute:
echo   npm run dev
echo.

pause