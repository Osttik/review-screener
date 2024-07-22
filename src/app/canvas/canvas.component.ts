import { Component, OnInit } from '@angular/core';
const { ipcRenderer } = (window as any).require('electron');

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  isDrawing = false;
  drawMode = false;
  img!: HTMLImageElement;
  reviews: any[] = [];

  ngOnInit() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    ipcRenderer.on('load-screenshot', (event: any, screenshotPath: string) => {
      this.img = new Image();
      this.img.src = screenshotPath;
      this.img.onload = () => {
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;
        this.ctx.drawImage(this.img, 0, 0);
      };
    });

    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
  }

  startDrawing(event: any) {
    if (!this.drawMode) return;
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: any) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
  }

  exit() {
    window.close();
  }

  saveCanvas() {
    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas.png';
    link.click();
  }

  addReview() {
    const review = document.createElement('div');
    review.contentEditable = "true";
    review.className = 'review-box';
    review.innerText = 'Enter review...';
    review.draggable = true;
    document.getElementById('canvas-container')!.appendChild(review);

    review.addEventListener('dragstart', (event) => {
      event.dataTransfer!.setData('text/plain', ""/*null*/);
      review.classList.add('dragging');
    });

    review.addEventListener('dragend', () => {
      review.classList.remove('dragging');
    });

    this.reviews.push(review);
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    const drawModeBtn = document.getElementById('draw-mode-btn') as HTMLButtonElement;
    drawModeBtn.innerText = this.drawMode ? 'Turn Off Draw Mode' : 'Turn On Draw Mode';
  }
}
