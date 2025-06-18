const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

let mainWindow;

// Diretórios de cache
const CACHE_DIR = path.join(__dirname, '../public/cache');
const GAMES_CACHE_DIR = path.join(CACHE_DIR, 'games');
const IMAGES_CACHE_DIR = path.join(CACHE_DIR, 'images');

// Garantir que os diretórios de cache existam
function ensureCacheDirectories() {
  const dirs = [CACHE_DIR, GAMES_CACHE_DIR, IMAGES_CACHE_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Diretório criado: ${dir}`);
    }
  });
}

// Função para baixar imagem
async function downloadImage(imageUrl, savePath) {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'GamepassLauncher/1.0'
      }
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        console.log(`✅ Imagem baixada: ${path.basename(savePath)}`);
        resolve(true);
      });

      writer.on('error', (error) => {
        console.error(`❌ Erro ao baixar imagem:`, error.message);
        // Tentar remover arquivo corrompido
        if (fs.existsSync(savePath)) {
          fs.unlinkSync(savePath);
        }
        reject(error);
      });
    });
  } catch (error) {
    console.error(`❌ Erro no download da imagem:`, error.message);
    throw error;
  }
}

// ==================== FUNÇÕES AUXILIARES DE CACHE ====================

// Função para cachear imagens de um jogo
async function cacheGameImages(gameId, gameData) {
  const gameDir = path.join(IMAGES_CACHE_DIR, gameId.toString());

  // Criar diretório do jogo se não existir
  if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir, { recursive: true });
  }

  const cachedImages = {};
  const imageTypes = ['cover', 'background', 'screenshot', 'logo'];

  for (const type of imageTypes) {
    const imageUrl = gameData[type] || gameData[`${type}_url`];

    if (imageUrl) {
      try {
        const cachedPath = await downloadAndCacheImage(imageUrl, gameDir, `${type}.jpg`);
        if (cachedPath) {
          cachedImages[type] = cachedPath;
        }
      } catch (error) {
        console.warn(`⚠️ Falha ao cachear ${type} para ${gameData.name}:`, error.message);
      }
    }
  }

  // Cachear screenshots se existirem
  if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
    cachedImages.screenshots = [];

    for (let i = 0; i < gameData.screenshots.length; i++) {
      try {
        const screenshotUrl = gameData.screenshots[i];
        const cachedPath = await downloadAndCacheImage(screenshotUrl, gameDir, `screenshot_${i}.jpg`);
        if (cachedPath) {
          cachedImages.screenshots.push(cachedPath);
        }
      } catch (error) {
        console.warn(`⚠️ Falha ao cachear screenshot ${i} para ${gameData.name}:`, error.message);
      }
    }
  }

  return cachedImages;
}

// Função para baixar e cachear uma imagem
async function downloadAndCacheImage(imageUrl, targetDir, filename) {
  return new Promise((resolve, reject) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      reject(new Error('URL da imagem inválida'));
      return;
    }

    const targetPath = path.join(targetDir, filename);

    // Se já existe, retornar o caminho
    if (fs.existsSync(targetPath)) {
      resolve(targetPath);
      return;
    }

    const https = require('https');
    const http = require('http');

    const client = imageUrl.startsWith('https:') ? https : http;

    const request = client.get(imageUrl, (response) => {
      // Verificar se é uma resposta de sucesso
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      // Verificar se é uma imagem
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error(`Tipo de conteúdo inválido: ${contentType}`));
        return;
      }

      const file = fs.createWriteStream(targetPath);

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(targetPath);
      });

      file.on('error', (error) => {
        fs.unlink(targetPath, () => { }); // Remover arquivo parcial
        reject(error);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    // Timeout de 30 segundos
    request.setTimeout(30000, () => {
      request.abort();
      reject(new Error('Timeout ao baixar imagem'));
    });
  });
}

function createWindow() {
  // Criar a janela principal
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Permitir carregamento de imagens externas
      allowRunningInsecureContent: true // Permitir conteúdo HTTP/HTTPS
    },
    frame: false, // Interface customizada
    titleBarStyle: 'hidden',
    show: false,
    backgroundColor: '#0e1e25', // Cor de fundo escura
    icon: path.join(__dirname, '../public/assets/images/icon.png')
  });

  // URL do Next.js
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Mostrar quando estiver pronto
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Configurações do app
app.whenReady().then(() => {
  ensureCacheDirectories();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers para comunicação com o frontend

// Controle da janela
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Sistema de arquivos
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Download de arquivos
ipcMain.handle('download-file', async (event, url, savePath) => {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve({ success: true }));
      writer.on('error', (error) => reject({ success: false, error: error.message }));
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Executar processos
ipcMain.handle('run-process', async (event, command, args = []) => {
  try {
    const child = spawn(command, args);
    return { success: true, pid: child.pid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Abrir diálogos
ipcMain.handle('show-dialog', async (event, type, options) => {
  try {
    let result;
    switch (type) {
      case 'open':
        result = await dialog.showOpenDialog(mainWindow, options);
        break;
      case 'save':
        result = await dialog.showSaveDialog(mainWindow, options);
        break;
      case 'message':
        result = await dialog.showMessageBox(mainWindow, options);
        break;
    }
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Abrir URLs externas
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// ==================== SISTEMA DE CACHE ====================

// Carregar cache de jogos
ipcMain.handle('cache-load-games', async () => {
  try {
    const cacheFilePath = path.join(GAMES_CACHE_DIR, 'games_cache.json');

    if (!fs.existsSync(cacheFilePath)) {
      return { success: true, data: null, cached: false };
    }

    const stats = fs.statSync(cacheFilePath);
    const now = new Date();
    const fileAge = now - stats.mtime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (fileAge > maxAge) {
      console.log('🕐 Cache expirado, será renovado');
      return { success: true, data: null, cached: false, expired: true };
    }

    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    console.log(`📦 Cache carregado: ${cacheData.games?.length || 0} jogos`);

    return {
      success: true,
      data: cacheData,
      cached: true,
      lastUpdate: stats.mtime
    };
  } catch (error) {
    console.error('❌ Erro ao carregar cache:', error);
    return { success: false, error: error.message };
  }
});

// Salvar cache de jogos
ipcMain.handle('cache-save-games', async (event, gamesData) => {
  try {
    const cacheFilePath = path.join(GAMES_CACHE_DIR, 'games_cache.json');

    const cacheData = {
      lastUpdate: new Date().toISOString(),
      totalGames: gamesData.length,
      games: gamesData
    };

    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
    console.log(`💾 Cache salvo: ${gamesData.length} jogos`);

    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao salvar cache:', error);
    return { success: false, error: error.message };
  }
});

// Cachear imagens de um jogo específico
ipcMain.handle('cache-game-images', async (event, gameId, gameData) => {
  try {
    console.log(`🖼️ Iniciando cache de imagens para: ${gameData.name}`);
    const cachedImages = await cacheGameImages(gameId, gameData);
    return { success: true, data: cachedImages };
  } catch (error) {
    console.error(`❌ Erro ao cachear imagens do jogo ${gameId}:`, error);
    return { success: false, error: error.message };
  }
});

// Cachear imagens em lote (com progresso)
ipcMain.handle('cache-images-batch', async (event, games) => {
  try {
    const total = games.length;
    let processed = 0;
    const results = [];

    console.log(`🚀 Iniciando cache em lote: ${total} jogos`);

    for (const game of games) {
      try {
        const cachedImages = await cacheGameImages(game.id, game);
        results.push({
          gameId: game.id,
          success: true,
          images: cachedImages
        });

        processed++;

        // Enviar progresso para o frontend
        mainWindow.webContents.send('cache-progress', {
          processed,
          total,
          current: game.name,
          percentage: Math.round((processed / total) * 100)
        });

        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.warn(`⚠️ Erro ao cachear jogo ${game.name}:`, error.message);
        results.push({
          gameId: game.id,
          success: false,
          error: error.message
        });
        processed++;
      }
    }

    console.log(`✅ Cache em lote concluído: ${processed}/${total}`);
    return { success: true, results };

  } catch (error) {
    console.error('❌ Erro no cache em lote:', error);
    return { success: false, error: error.message };
  }
});

// Verificar status do cache
ipcMain.handle('cache-status', async () => {
  try {
    const cacheFilePath = path.join(GAMES_CACHE_DIR, 'games_cache.json');

    if (!fs.existsSync(cacheFilePath)) {
      return {
        success: true,
        exists: false,
        size: 0,
        games: 0,
        lastUpdate: null
      };
    }

    const stats = fs.statSync(cacheFilePath);
    const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));

    // Contar imagens em cache
    let totalImages = 0;
    let totalSize = 0;

    if (fs.existsSync(IMAGES_CACHE_DIR)) {
      const gamesDirs = fs.readdirSync(IMAGES_CACHE_DIR);
      gamesDirs.forEach(gameDir => {
        const gamePath = path.join(IMAGES_CACHE_DIR, gameDir);
        if (fs.statSync(gamePath).isDirectory()) {
          const images = fs.readdirSync(gamePath);
          totalImages += images.length;

          images.forEach(image => {
            const imagePath = path.join(gamePath, image);
            totalSize += fs.statSync(imagePath).size;
          });
        }
      });
    }

    return {
      success: true,
      exists: true,
      size: stats.size,
      games: cacheData.games?.length || 0,
      lastUpdate: stats.mtime,
      images: {
        count: totalImages,
        sizeBytes: totalSize,
        sizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
      }
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do cache:', error);
    return { success: false, error: error.message };
  }
});

// Limpar cache
ipcMain.handle('cache-clear', async (event, type = 'all') => {
  try {
    let cleared = false;

    if (type === 'all' || type === 'games') {
      const cacheFilePath = path.join(GAMES_CACHE_DIR, 'games_cache.json');
      if (fs.existsSync(cacheFilePath)) {
        fs.unlinkSync(cacheFilePath);
        console.log('🗑️ Cache de jogos limpo');
        cleared = true;
      }
    }

    if (type === 'all' || type === 'images') {
      if (fs.existsSync(IMAGES_CACHE_DIR)) {
        fs.rmSync(IMAGES_CACHE_DIR, { recursive: true, force: true });
        fs.mkdirSync(IMAGES_CACHE_DIR, { recursive: true });
        console.log('🗑️ Cache de imagens limpo');
        cleared = true;
      }
    }

    return { success: true, cleared };
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return { success: false, error: error.message };
  }
});