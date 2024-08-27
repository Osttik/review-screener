import { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { pathes } from './pathes';
import { imageService } from './services/image.service';
import { dataService } from './services/data.service';

let mainWindow: BrowserWindow;
let canvasWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false,
    fullscreen: true,
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, '../../dist/review-screener/browser/index.html'));
}

async function createCanvasWindow(screenshotPath: string) {
  if (!canvasWindow) {
    canvasWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await canvasWindow.loadFile(path.join(__dirname, '../../dist/review-screener/browser/index.html'));
    canvasWindow.webContents.send('navigate-to-canvas', dataService.canvas);

    mainWindow.hide();
    canvasWindow.on('closed', () => {
      canvasWindow = null;
    });
  }

  canvasWindow.webContents.once('did-finish-load', () => {
    canvasWindow?.webContents.send('load-screenshot', screenshotPath);
  });
}

ipcMain.on('capture-screen', captureScreenshot);
ipcMain.on('save-subimage', (event, subimageDataUrl) => {
  saveSubimage(subimageDataUrl, event.sender);
});

ipcMain.on('save-canvas-data', (event, canvasData) => {
  dataService.canvas = canvasData;
  dataService.saveCanvas();
})

function saveSubimage(subimageDataUrl: string, sender: any) {
  console.log("Create subimage and send it")
  const base64Data = subimageDataUrl.replace(/^data:image\/png;base64,/, '');
  const binaryData = Buffer.from(base64Data, 'base64');
  const subimagePath = path.join(pathes.imagesFolder, `${imageService.generateImageName(subimageDataUrl)}.png`);
  mainWindow.hide();
  fs.writeFile(subimagePath, binaryData, async (err) => {
    if (err) {
      console.error('Failed to save subimage:', err);
    } else {
      console.log('Subimage saved to:', subimagePath);
      //sender.send('add-image', subimagePath);

      // If the canvas window is open, load the new image into it
      if (!canvasWindow) {
        await createCanvasWindow(subimagePath);
      }

      canvasWindow!.webContents.send('add-image', subimagePath);
    }
  });
}

async function captureScreenshot(event: any) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }
  });

  for (const source of sources) {
    if (source.name === 'Entire Screen' || source.name.startsWith('Screen') || true) {
      const screenshotPath = path.join(pathes.temporaryScreenshotsFolder, `${imageService.generateImageName(source.thumbnail.toDataURL())}.png`);
      const screenshot = source.thumbnail.toPNG();
      
      fs.writeFile(screenshotPath, screenshot, (err) => {
        if (err) return console.log(err);
        event.sender.send('screenshot-captured', screenshotPath);
        mainWindow.show();
      });
      return;
    }
  }
}

app.on('ready', () => {
  createMainWindow();
  console.log("READY")
  globalShortcut.register('Control+PrintScreen', () => {
    console.log("START")
    mainWindow.webContents.send('capture-screen');
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