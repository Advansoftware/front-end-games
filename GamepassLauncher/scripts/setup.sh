#!/bin/bash

# GamepassLauncher Setup Script
echo "🎮 Configurando GamepassLauncher..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 16+ primeiro."
    echo "📥 Download: https://nodejs.org/"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p downloads
mkdir -p emulators
mkdir -p configs
mkdir -p roms
mkdir -p saves

echo "✅ Diretórios criados"

# Fazer build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do projeto"
    exit 1
fi

echo "✅ Build concluído com sucesso"

# Configurações iniciais
echo "⚙️  Aplicando configurações iniciais..."

# Criar arquivo de configuração se não existir
if [ ! -f "./configs/app-config.json" ]; then
    cat > "./configs/app-config.json" << EOF
{
  "version": "1.0.0",
  "theme": "xbox",
  "soundsEnabled": true,
  "downloadPath": "./downloads",
  "yuzuPath": "./emulators/yuzu",
  "autoUpdate": true,
  "gamepadEnabled": true,
  "lastUpdateCheck": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    echo "✅ Arquivo de configuração criado"
fi

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📖 Comandos disponíveis:"
echo "  npm run dev        - Executar em modo desenvolvimento"
echo "  npm start          - Executar aplicação"
echo "  npm run build      - Fazer build da aplicação"
echo "  npm run electron-pack - Empacotar para distribuição"
echo ""
echo "🚀 Para iniciar o GamepassLauncher, execute:"
echo "  npm run dev"
echo ""