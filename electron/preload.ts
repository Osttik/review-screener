import { ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('screenshot-captured', (event, screenshotPath) => {
    const screenshot = document.getElementById('screenshot') as HTMLImageElement;
    screenshot.src = screenshotPath;
    document.getElementById('select-area-btn')!.style.display = 'inline';
  });
});
