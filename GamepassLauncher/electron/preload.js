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

  // Gamepad API
  getGamepads: () => navigator.getGamepads(),

  // Notificações
  showNotification: (title, body) => {
    new Notification(title, { body });
  }
});