import { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, WebContents } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { pathes } from './pathes';
import { imageService } from './services/image.service';
import { Report } from './report';

fs.mkdirSync(pathes.imagesFolder, { recursive: true });
fs.mkdirSync(pathes.temporaryScreenshotsFolder, { recursive: true });

let mainWindow: BrowserWindow;
let canvasWindow: BrowserWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Ensure node integration is turned off
      contextIsolation: true, // Ensure context isolation is enabled
    },
    frame: false,
    fullscreen: true,
    show: true, // Start hidden
  });
  mainWindow.maximize();
  mainWindow.hide();

  mainWindow.loadFile(path.join(__dirname, '../../dist/review-screener/browser/index.html'));

  
  /*ipcMain.on('show-canvas', (event, screenshotPath) => {
    createCanvasWindow(screenshotPath);
  });*/
}

ipcMain.on('capture-screen', captureScreenshot);
ipcMain.on('save-canvas', (event, canvas: Report) => {
  fs.writeFile(path.join(pathes.reportsFolder, "canvas.json"), JSON.stringify(canvas), (err) => console.error(err));
});
ipcMain.on('save-subimage', (event, subimageDataUrl) => {
  saveSubimage(subimageDataUrl, event.sender);
});

function saveSubimage(subimageDataUrl: string, sender: WebContents) {
  // Convert base64 data URL to binary buffer
  const base64Data = subimageDataUrl.replace(/^data:image\/png;base64,/, '');
  const binaryData = Buffer.from(base64Data, 'base64');
  
  // Define the path to save the subimage
  const subimagePath = path.join(pathes.imagesFolder, `${imageService.generateImageName(subimageDataUrl)}.png`);
  
  // Write the binary data to a file
  fs.writeFile(subimagePath, binaryData, (err) => {
    if (err) {
      console.error('Failed to save subimage:', err);
    } else {
      console.log('Subimage saved to:', subimagePath);
      sender.send('add-image', subimagePath);
    }
  });
}

async function captureScreenshot(event: any) {
  console.log("capture-screen start")
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  // Set thumbnail size to the primary display's size
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }
  });
  console.log("capture-screen", sources.length)
  let i = 0;
  for (const source of sources) {
    i++;
    console.log("capture-screen NAME", source.name)
    if (source.name === 'Entire Screen' || source.name.startsWith('Screen') || true) {
      const screenshotPath = path.join(pathes.temporaryScreenshotsFolder, `${imageService.generateImageName(source.thumbnail.toDataURL())}.png`);
      const screenshot = source.thumbnail.toPNG();
      console.log("capture-screen yappy source")
      fs.writeFile(screenshotPath, screenshot, (err) => {
        if (err) return console.log(err);
        console.log("capture-screen yappy source", screenshotPath)
        event.sender.send('screenshot-captured', screenshotPath);
        mainWindow.show();
      });
      return;
    }
  }
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
      nodeIntegration: false, // Ensure node integration is turned off
      contextIsolation: true, // Ensure context isolation is enabled
    },
  });

  canvasWindow.loadFile(path.join(__dirname, '../../dist/review-screener/browser/canvas.html'));

  canvasWindow.webContents.once('did-finish-load', () => {
    console.log("DID finish, load-screenshot")
    canvasWindow.webContents.send('load-screenshot', screenshotPath);
  });
}

app.on('ready', () => {
  createMainWindow();
  console.log("READY");
  globalShortcut.register('Control+PrintScreen', () => {
    console.log("SEND, show");
    
    mainWindow.webContents.send('capture-screen');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log("THIS?")
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
