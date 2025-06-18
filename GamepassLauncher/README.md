# 🎮 Gamepass Launcher

Um lançador de jogos moderno inspirado no Xbox Gamepass, PS5 e Nintendo Switch, construído com Electron, Next.js e Material-UI.

![Gamepass Launcher](https://img.shields.io/badge/Version-1.0.0-green)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Características

### 🎨 Interface Moderna
- **Temas Personalizáveis**: Xbox (Verde), PlayStation 5 (Azul), Nintendo Switch (Vermelho)
- **Design Responsivo**: Interface fluida inspirada nos consoles modernos
- **Animações Suaves**: Transições e efeitos visuais com Framer Motion
- **Cards de Jogos**: Layout similar ao Xbox Cloud Gaming

### 🎮 Controle Completo
- **Suporte a Gamepad**: Navegação completa com controle Xbox, PlayStation ou genérico
- **Detecção Automática**: Reconhecimento automático de controles conectados
- **Mapeamento de Botões**: Configuração personalizada de botões
- **Vibração**: Feedback tátil quando suportado

### 🔊 Sistema de Áudio
- **Sons Personalizados**: Efeitos sonoros únicos para cada tema
- **Controle de Volume**: Ativar/desativar sons facilmente
- **Sons de Navegação**: Feedback auditivo para todas as ações

### 💾 Gerenciamento de Jogos
- **Banco Local**: Armazenamento em JSON com sincronização remota
- **Downloads**: Sistema completo de download com progresso em tempo real
- **Emulação Yuzu**: Download e configuração automática do emulador
- **Configurações por Jogo**: Aplicação automática de configs específicas

### 🌐 Conectividade
- **API Mock**: Sistema de API simulada para desenvolvimento
- **Sincronização**: Atualização automática do catálogo de jogos
- **Downloads em Nuvem**: Simulação de sistema tipo Steam/Gamepass
- **Atualizações**: Sistema de verificação e aplicação de updates

## 🚀 Instalação Rápida

### Pré-requisitos
- **Node.js 16+**: [Download aqui](https://nodejs.org/)
- **Git**: Para clonar o repositório
- **Sistema Operacional**: Windows 10+, Linux, ou macOS

### 🐧 Linux / macOS
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/gamepass-launcher.git
cd gamepass-launcher

# Executar setup automático
chmod +x scripts/setup.sh
./scripts/setup.sh

# Iniciar em modo desenvolvimento
npm run dev
```

### 🪟 Windows
```cmd
# Clonar o repositório
git clone https://github.com/seu-usuario/gamepass-launcher.git
cd gamepass-launcher

# Executar setup automático
scripts\setup.bat

# Iniciar em modo desenvolvimento
npm run dev
```

### 📦 Instalação Manual
```bash
# 1. Instalar dependências
npm install

# 2. Fazer build
npm run build

# 3. Criar diretórios
mkdir downloads emulators configs roms saves

# 4. Iniciar aplicação
npm run dev
```

## 📖 Como Usar

### 🎯 Navegação Básica
- **Mouse**: Clique nos jogos e botões
- **Teclado**: Use as setas e Enter/Esc
- **Gamepad**: Navegue com D-pad ou analógico esquerdo

### 🎮 Controles do Gamepad
- **A/Cross**: Confirmar seleção
- **B/Circle**: Voltar/Cancelar
- **Start/Options**: Abrir menu lateral
- **Back/Share**: Voltar à tela anterior

### 🎨 Trocar Temas
1. Abra o menu lateral (botão superior esquerdo ou Start no controle)
2. Clique em um dos temas: Xbox, PS5 ou Nintendo Switch
3. O tema será aplicado instantaneamente

### 📥 Baixar Jogos
1. Navegue pela grade de jogos
2. Clique no jogo desejado para ver detalhes
3. Clique no botão "Baixar"
4. Acompanhe o progresso na tela de detalhes

### ⚙️ Configurações
- **Áudio**: Ativar/desativar sons por tema
- **Downloads**: Configurar pasta de downloads
- **Emulador**: Gerenciar instalação do Yuzu
- **Atualizações**: Verificar updates manuais ou automáticos

## 🛠️ Desenvolvimento

### 📁 Estrutura do Projeto
```
GamepassLauncher/
├── electron/                 # Código do Electron
│   ├── main.js              # Processo principal
│   └── preload.js           # Script de preload
├── src/                     # Código do Next.js
│   ├── components/          # Componentes React
│   ├── contexts/           # Contextos (temas, jogos)
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Páginas Next.js
│   └── services/           # Serviços e APIs
├── public/                 # Arquivos estáticos
│   ├── assets/            # Imagens, sons, vídeos
│   └── data/              # Dados mockados
├── scripts/               # Scripts de configuração
└── configs/              # Arquivos de configuração
```

### 🔧 Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento (Next.js + Electron)
npm run build        # Build de produção
npm start           # Executar aplicação buildada
npm run electron-pack # Empacotar para distribuição
```

### 🔌 APIs e Integração

#### Electron APIs Disponíveis
```javascript
// Controle de janela
window.electronAPI.minimizeWindow()
window.electronAPI.maximizeWindow()
window.electronAPI.closeWindow()

// Sistema de arquivos
window.electronAPI.readFile(path)
window.electronAPI.writeFile(path, data)

// Downloads
window.electronAPI.downloadFile(url, savePath)

// Processos
window.electronAPI.runProcess(command, args)

// Diálogos
window.electronAPI.showDialog(type, options)
```

#### Contextos React
```javascript
// Temas
const { currentTheme, changeTheme, playSound } = useTheme()

// Jogos
const { games, downloadGame, launchGame } = useGames()

// Gamepad
const { gamepadConnected, getNavigationInput } = useGamepad()
```

## 🎯 Configuração do Emulador

### 📋 Yuzu Setup
O launcher gerencia automaticamente o Yuzu:

1. **Download Automático**: Baixa a versão mais recente
2. **Configuração**: Aplica settings otimizados por jogo
3. **Firmware**: Suporte para firmware do Switch
4. **Prod Keys**: Gerenciamento de chaves de produção

### 🗂️ Estrutura de Arquivos
```
GamepassLauncher/
├── downloads/        # ROMs baixadas
├── emulators/       # Yuzu e outros emuladores
├── configs/         # Configurações por jogo
├── roms/           # ROMs organizadas
└── saves/          # Save games
```

## 🌐 API Mock

### 📡 Endpoints Simulados
- `GET /api/games` - Lista de jogos
- `POST /api/download` - Iniciar download
- `GET /api/emulator` - Status do emulador

### 🔧 Configuração da API
Edite `src/contexts/GamesContext.js` para configurar URLs:
```javascript
const API_CONFIG = {
  gamesApi: 'http://localhost:3001/api/games',
  yuzuDownload: 'https://github.com/yuzu-emu/yuzu-mainline/releases/latest',
  firmwareDownload: 'https://github.com/THZoria/NX_Firmware/releases/latest'
}
```

## 🎨 Personalização

### 🖌️ Criando Novos Temas
1. Edite `src/contexts/ThemeContext.js`
2. Adicione seu tema no objeto `themes`
3. Configure cores, tipografia e componentes
4. Adicione sons personalizados em `public/assets/sounds/`

### 🔊 Adicionando Sons
Coloque arquivos `.mp3` em:
```
public/assets/sounds/
├── xbox/
│   ├── navigate.mp3
│   ├── confirm.mp3
│   └── theme-change.mp3
├── ps5/
└── switch/
```

## 🚀 Distribuição

### 📦 Gerar Executável
```bash
# Build completo
npm run electron-pack

# Arquivos gerados em dist/
```

### 🌍 Plataformas Suportadas
- **Windows**: `.exe` installer
- **Linux**: `.AppImage`
- **macOS**: `.dmg` (requer certificado)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🙏 Agradecimentos

- **Nintendo**: Inspiração do design do Switch
- **Microsoft**: Interface do Xbox Gamepass
- **Sony**: Elementos visuais do PS5
- **Yuzu Team**: Emulador Nintendo Switch
- **Electron**: Framework para aplicações desktop
- **Next.js**: Framework React
- **Material-UI**: Componentes de interface

## 📞 Suporte

- 🐛 **Bugs**: Abra uma issue no GitHub
- 💡 **Sugestões**: Use as discussões do GitHub
- 📧 **Contato**: seu-email@exemplo.com

---

**🎮 Feito com ❤️ para a comunidade gaming**