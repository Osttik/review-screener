import { Component } from '@angular/core';
const { ipcRenderer } = (window as any).require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectArea() {
    const screenshot = document.getElementById('screenshot') as HTMLImageElement;
    screenshot.style.cursor = 'crosshair';

    screenshot.addEventListener('click', (event) => {
      const x = event.offsetX;
      const y = event.offsetY;
      const width = 200; // Example width
      const height = 150; // Example height

      ipcRenderer.send('show-canvas', screenshot.src, x, y, width, height);
    }, { once: true });
  }
}
