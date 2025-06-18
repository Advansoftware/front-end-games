const { contextBridge, ipcRenderer } = require('electron');

// API segura para o frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Controle da janela
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  // Sistema de arquivos
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),

  // Downloads
  downloadFile: (url, savePath) => ipcRenderer.invoke('download-file', url, savePath),

  // Processos
  runProcess: (command, args) => ipcRenderer.invoke('run-process', command, args),

  // Diálogos
  showDialog: (type, options) => ipcRenderer.invoke('show-dialog', type, options),

  // URLs externas
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Sistema de Cache Inteligente
  cache: {
    // Carregar cache de jogos
    loadGames: () => ipcRenderer.invoke('cache-load-games'),

    // Salvar cache de jogos
    saveGames: (gamesData) => ipcRenderer.invoke('cache-save-games', gamesData),

    // Cachear imagens de um jogo específico
    cacheGameImages: (gameId, gameData) => ipcRenderer.invoke('cache-game-images', gameId, gameData),

    // Cachear imagens em lote
    cacheImagesBatch: (games) => ipcRenderer.invoke('cache-images-batch', games),

    // Verificar status do cache
    getStatus: () => ipcRenderer.invoke('cache-status'),

    // Limpar cache
    clear: (type = 'all') => ipcRenderer.invoke('cache-clear', type),

    // Listener para progresso do cache
    onProgress: (callback) => {
      ipcRenderer.on('cache-progress', (event, data) => callback(data));
    },

    // Remover listener de progresso
    removeProgressListener: () => {
      ipcRenderer.removeAllListeners('cache-progress');
    }
  },

  // Gamepad API
  getGamepads: () => navigator.getGamepads(),

  // Notificações
  showNotification: (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
});