import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import ScreenshotService from '../../services/screenshot.service';
import { CanvasImage, CanvasText, ICanvasObject } from '../../data/types';
import CanvasService from '../../services/canvas.service';
import { LinePixel } from '../../data/layeredImage';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('offscreenCanvasElement') offscreenCanvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('parent') parentRef!: ElementRef<HTMLDivElement>;

  stageConfig = {
    width: 500,
    height: 500,
  };

  rectConfig = {
    x: 20,
    y: 20,
    width: 100,
    height: 100,
    fill: 'red',
    draggable: true,
  };

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  ctx2!: CanvasRenderingContext2D;
  isDrawing = false;
  drawMode = false;
  startX = 0;
  startY = 0;
  startX1 = 0;
  startY1 = 0;
  reviews: any[] = [];
  public imgs: CanvasImage[] = [];
  private _isSaved = false;
  public canvasObjects: ICanvasObject[] = [];
  private _isDragging = false;
  private _objectToDrag: ICanvasObject | undefined = undefined;
  public isEditingText = false;
  public fontSize = 16;
  public isAddingReview = false;
  public points: any[] = [];

  constructor(private _screenshotService: ScreenshotService, private _canvasService: CanvasService) {}
  
  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    //this.ctx2 = this.offscreenCanvasElement.nativeElement.getContext('2d')!;
    this.ctx.font = `bold italic ${this.fontSize}px Arial`;
    this.canvasRef.nativeElement.addEventListener('mousedown', this.startAction.bind(this));
    this.canvasRef.nativeElement.addEventListener('mousemove', this.performAction.bind(this));
    this.canvasRef.nativeElement.addEventListener('mouseup', this.stopAction.bind(this));
    this.canvasRef.nativeElement.addEventListener('mouseout', this.stopAction.bind(this));
    this.ctx.font = `bold italic ${this.fontSize}px Arial`;

    setTimeout(() => this._canvasService.initializeMatrix(1000, 1000), 0);
  }

  ngOnInit() {
    var img = new Image();
    img.src = this._screenshotService.subImage;
    img.onload = () => {
      this.resizeCanvas();
      this._canvasService.addImage(img, 0, 0);
      this.imgs.push(new CanvasImage(
        img, 0, 0
      ));
      const f = () => {this.drawImage();requestAnimationFrame(f)}
      //requestAnimationFrame(f);
    };
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  @HostListener('window:resize')
  resizeCanvas() {
    this.canvasRef.nativeElement.width = window.innerWidth;
    this.canvasRef.nativeElement.height = window.innerHeight;
  }
  scale = 1;
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      event.preventDefault();
      this.zoom(event.deltaY);
      console.log("Zoom", event)
    }
  }

  zoom(deltaY: number): void {
    const zoomFactor = 0.1;
    if (deltaY < 0) {
      this.scale += zoomFactor; // Zoom in
    } else {
      this.scale -= zoomFactor; // Zoom out
      this.scale = Math.max(this.scale, zoomFactor); // Prevent scale from becoming negative or zero
    }

    this.applyZoom();
  }

  applyZoom(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = this.ctx;

    context.setTransform(this.scale, 0, 0, this.scale, 0, 0);
  }

  startAction(event: MouseEvent) {
    if (this.drawMode) {
      this.startDrawing(event);
    } else {
      this.startDragging(event);
    }
  }

  performAction(event: MouseEvent) {
    if (this.drawMode) {
      this.draw(event);
    } else {
      this.drag(event);
    }
  }

  stopAction(event: MouseEvent) {
    if (this.drawMode) {
      this.stopDrawing();
    } else {
      this.stopDragging();
    }
  }

  adjustSize(event: Event) {
    const textarea = this.textArea.nativeElement;
    textarea.style.width = 'auto'; // Reset width to auto
    textarea.style.height = 'auto'; // Reset height to auto

    const lines = textarea.value.split('\n');
    const lineCount = lines.length;

    // Adjust width based on the longest line
    const longestLineLength = Math.max(...lines.map(line => line.length));
    const newWidth = longestLineLength * /*8*/9.7; // Adjust the multiplier as needed

    textarea.style.width = `${newWidth}px`;
    textarea.style.height = `${lineCount * 1.12}em`; // Adjust the multiplier as needed
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    //this.ctx.beginPath();
    //this.ctx.moveTo(event.offsetX, event.offsetY);
    this.points.push({x: event.offsetX, y: event.offsetY});
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    this.points.push({x: event.offsetY, y: event.offsetX})
    //this.ctx.lineTo(event.offsetX, event.offsetY);
    //this.ctx.strokeStyle = 'red';
    //this.ctx.lineWidth = 2;
    //this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
    console.log(this.points);
    for (let i = 1; i < this.points.length; i++) {
      const point1 = this.points[i-1];
      const point2 = this.points[i];

      const p = this._canvasService.calculateLinePixels(point1.x, point1.y, point2.x, point2.y, 2);
      for (let j = 0; j < p.length; j++) {
        const pp = p[j];
        this._canvasService.canvasMatrix.matrix[pp.x][pp.y].linesPixels.push(new LinePixel('red', '0'));
      }
    }
    this.points = [];
    //this.ctx.closePath();
  }

  startDragging(event: MouseEvent) {
    this._objectToDrag = this._canvasService.getObjectByMouse(event.offsetX, event.offsetY);
    
    if(!this._objectToDrag) return;

    this._isDragging = true;
    this.startX = event.offsetX - this._objectToDrag.boundaries[0].x;
    this.startY = event.offsetY - this._objectToDrag.boundaries[0].y;
    this.startX1 = event.offsetX - this._objectToDrag.boundaries[1].x;
    this.startY1 = event.offsetY - this._objectToDrag.boundaries[1].y;
  }

  addReviewTextArea(event: MouseEvent) {
    if (!this.isAddingReview || this.isEditingText) return;
    this.isEditingText = true;

    this.textArea.nativeElement.style.top = `${event.y}px`;
    this.textArea.nativeElement.style.left = `${event.x}px`;
    setTimeout(() => this.textArea.nativeElement.focus(), 50);
  }

  drag(event: MouseEvent) {
    if (!this._isDragging) return;
    this._objectToDrag!.boundaries[0].x = event.offsetX - this.startX;
    this._objectToDrag!.boundaries[0].y = event.offsetY - this.startY;
    this._objectToDrag!.boundaries[1].x = event.offsetX - this.startX1;
    this._objectToDrag!.boundaries[1].y = event.offsetY - this.startY1;
    this._objectToDrag!.object.x = event.offsetX - this.startX;
    this._objectToDrag!.object.y = event.offsetY - this.startY;
  }

  saveReview() {
    console.log("GET", this.textArea.nativeElement.style.left, this.textArea.nativeElement.style.top)
    this._canvasService.addText(this.textArea.nativeElement.value, Number.parseInt(this.textArea.nativeElement.style.left.split('px')[0]), Number.parseInt(this.textArea.nativeElement.style.top.split('px')[0]), this.fontSize);
    console.log(this._canvasService._canvasObjectsSubject.getValue().length)
    this.isAddingReview = false;
    this.isEditingText = false;
  }

  stopDragging() {
    this._isDragging = false;
  }
  public px: any = [];
  drawImage() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.ctx.font = `bold italic ${this.fontSize}px Arial`;
    //this.ctx.drawImage(this.img, this.imgX, this.imgY);
    const objects = this._canvasService._canvasObjectsSubject.getValue();
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];

      if (object.type === "IMAGE") {
        this.ctx.drawImage(object.object.img, object.object.x, object.object.y);
        continue;
      }

      /*this.ctx.textBaseline = 'top';
      (object as ICanvasObject<CanvasText>).object.text.split('\n').forEach((v, y) => {
        this.ctx.fillText(v, object.object.x, object.object.y + y * this.fontSize);
      });
      this.ctx.beginPath();
      this.ctx.moveTo(object.boundaries[0].x - 1, object.boundaries[0].y - 1);
      this.ctx.lineTo(object.boundaries[1].x + 1, object.boundaries[0].y - 1);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      //this.ctx.stroke();
      this.ctx.lineTo(object.boundaries[1].x + 1, object.boundaries[1].y + 1);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      //this.ctx.stroke();
      this.ctx.lineTo(object.boundaries[0].x - 1, object.boundaries[1].y + 1);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      //this.ctx.stroke();
      this.ctx.lineTo(object.boundaries[0].x - 1, object.boundaries[0].y - 1);
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.closePath();
    }
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < this.points.length; i++) {
      this.ctx.moveTo(this.points[i][0].x, this.points[i][0].y);
      for (let j = 1; j < this.points[i].length; j++) {
        this.ctx.lineTo(this.points[i][j].x, this.points[i][j].y);
      }
      this.ctx.stroke();
    }*/
    }
    this.ctx.closePath();

    const imageData = this.ctx.createImageData(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this._canvasService.canvasMatrix.matrix.forEach(xC => {
      xC.forEach(yC => {
        if (!yC.isEmpty()) {
          const index = (yC.y * imageData.width + yC.x) * 4;
          imageData.data[index + 0] = 255;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 255;
        }
      })
    })

    this.ctx.putImageData(imageData, 0, 0);
  }

  exit() {
    if(this._isSaved) return;
  }

  saveCanvas() {
    const dataURL = this.canvasRef.nativeElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas.png';
    link.click();
    this._isSaved = true;
  }

  addReview() {
    setTimeout(() => this.isAddingReview = true, 0);
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    const drawModeBtn = document.getElementById('draw-mode-btn') as HTMLButtonElement;
    drawModeBtn.innerText = this.drawMode ? 'Turn Off Draw Mode' : 'Turn On Draw Mode';
  }
}
