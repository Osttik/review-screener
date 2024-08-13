import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPCRenderer } from '../../server';
import ScreenshotService from '../../services/screenshot.service';

@Component({
  selector: 'app-screenshot-selector',
  templateUrl: './screenshot-selector.component.html',
  styleUrl: './screenshot-selector.component.scss'
})
export class ScreenshotSelectorComponent implements OnInit {
  public screenshotPath: string | null = null;
  private startX: number | null = null;
  private startY: number | null = null;
  private endX: number | null = null;
  private endY: number | null = null;
  private isSelecting: boolean = false;

  constructor(
    private _router: Router, 
    private _ngZone: NgZone, 
    private _screenshotService: ScreenshotService) 
  {
    this.screenshotPath = this._screenshotService.screenshotUrlRawValue;
    this._screenshotService.$screenshotUrl.subscribe(screenshotPath => {
      this._ngZone.run(() => {
        this.screenshotPath = screenshotPath;
      });
    });
  }

  ngOnInit() {
  }

  selectArea() {
    const screenshot = document.getElementById('screenshot') as HTMLImageElement;
    screenshot.style.cursor = 'crosshair';


    /*screenshot.addEventListener('click', (event) => {
      const x = event.offsetX;
      const y = event.offsetY;
      const width = 200; // Example width
      const height = 150; // Example height
      this._router.navigate([`/${CANVAS_PATH}`]);
    }, { once: true });*/
  }

  startSelection(event: MouseEvent) {
    this.isSelecting = true;
    this.startX = event.offsetX;
    this.startY = event.offsetY;
  }

  endSelection(event: MouseEvent) {
    this.isSelecting = false;
    this.endX = event.offsetX;
    this.endY = event.offsetY;
    this.createSubimage();
  }

  createSubimage() {
    if (this.screenshotPath && this.startX !== null && this.startY !== null && this.endX !== null && this.endY !== null) {
      const img = new Image();
      img.src = this.screenshotPath;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = Math.abs(this.endX! - this.startX!);
          const height = Math.abs(this.endY! - this.startY!);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(
            img,
            Math.min(this.startX!, this.endX!),
            Math.min(this.startY!, this.endY!),
            width,
            height,
            0,
            0,
            width,
            height
          );
          const subimageDataUrl = canvas.toDataURL('image/png');
          IPCRenderer.send('save-subimage', subimageDataUrl);
        }
      };
    }
  }
}
