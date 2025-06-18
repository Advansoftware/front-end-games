const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

let mainWindow;

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
      preload: path.join(__dirname, 'preload.js')
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
app.whenReady().then(createWindow);

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