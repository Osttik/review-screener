/*import { ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('screenshot-captured', (event, screenshotPath) => {
    const screenshot = document.getElementById('screenshot') as HTMLImageElement;
    screenshot.src = screenshotPath;
    document.getElementById('select-area-btn')!.style.display = 'inline';
  });
});*/
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, func: (event: any, ...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    }
  }
});
