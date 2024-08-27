import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { IPCRenderer } from '../../server';
import ScreenshotService from '../../services/screenshot.service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-screenshot-selector',
  templateUrl: './screenshot-selector.component.html',
  styleUrl: './screenshot-selector.component.scss'
})
export class ScreenshotSelectorComponent implements OnInit {
  @ViewChild('fabric') fabricRef!: ElementRef<HTMLCanvasElement>;
  
  public screenshotPath: string | null = null;
  private startX: number | null = null;
  private startY: number | null = null;
  private endX: number | null = null;
  private endY: number | null = null;

  constructor(
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
    this.startX = event.offsetX;
    this.startY = event.offsetY;
  }

  endSelection(event: MouseEvent) {
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
          const subImage = new Image();
          subImage.src = subimageDataUrl;

          subImage.onload = () => {
            const c = new fabric.Canvas(this.fabricRef.nativeElement, {
              width: 0,
              height: 0
            });
            
            c.add(new fabric.Image(subImage));

            this.startX = null;
            this.startY = null;
            this.endX = null;
            this.endY = null;
  
            //IPCRenderer.send('save-canvas-data', c.toJSON());
            IPCRenderer.send('save-subimage', subimageDataUrl);
          }
        }
      };
    }
  }
}
