import { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let mainWindow: BrowserWindow;
let canvasWindow: BrowserWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // Start hidden
  });

  mainWindow.loadFile(path.join(__dirname, '../../dist/review-screener/browser/index.html'));

  ipcMain.on('capture-screen', async (event) => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    for (const source of sources) {
      if (source.name === 'Entire Screen' || source.name.startsWith('Screen')) {
        const screenshotPath = path.join(os.tmpdir(), 'screenshot.png');
        const screenshot = source.thumbnail.toPNG();
        fs.writeFile(screenshotPath, screenshot, (err) => {
          if (err) return console.log(err);
          event.sender.send('screenshot-captured', screenshotPath);
        });
        return;
      }
    }
  });

  ipcMain.on('show-canvas', (event, screenshotPath) => {
    createCanvasWindow(screenshotPath);
  });
}

function createCanvasWindow(screenshotPath: string) {
  if (canvasWindow) {
    canvasWindow.close();
  }

  canvasWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  canvasWindow.loadFile(path.join(__dirname, '../../dist/my-electron-app/canvas.html'));

  canvasWindow.webContents.once('did-finish-load', () => {
    canvasWindow.webContents.send('load-screenshot', screenshotPath);
  });
}

app.on('ready', () => {
  createMainWindow();

  globalShortcut.register('Control+PrintScreen', () => {
    mainWindow.webContents.send('capture-screen');
    mainWindow.show();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
