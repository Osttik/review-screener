import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import ScreenshotService from '../../services/screenshot.service';
import CanvasService from '../../services/canvas.service';
import { BehaviorSubject } from 'rxjs';
import { fabric } from 'fabric';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('parent') parentRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fabricSurface') fabricSurfaceRef!: ElementRef<HTMLCanvasElement>;

  private _canvas!: fabric.Canvas;
  private _canvasState: string[] = [];
  private _currentStateIndex: number = -1;
  private _undoStatus: boolean = false;
  private _redoStatus: boolean = false;

  stageConfig = new BehaviorSubject({
    width: 500,
    height: 500,
  });
  public drawMode = false;
  public drawingColor = '#000000'; // Default color
  public drawingLineWidth = 10; // Default line width
  public textColor = '#000000'; // Default color
  public fontSize = 16;
  startX = 0;
  startY = 0;
  startX1 = 0;
  startY1 = 0;
  reviews: any[] = [];
  private _isSaved = false;
  public isAddingReview = false;
  public points: any[] = [];
  isPanning = false;
  path!: fabric.Path;
  state: any[] = [];

  constructor(private _screenshotService: ScreenshotService, private _canvasService: CanvasService, private _cdr: ChangeDetectorRef) {}
  
  ngAfterViewInit() {
    this._canvas = new fabric.Canvas(this.fabricSurfaceRef.nativeElement, {
      backgroundColor: '#ebebef',
      isDrawingMode: this.drawMode,
      selection: false,
      preserveObjectStacking: true,
      width: window.innerWidth,
      height: window.innerHeight,
      fireRightClick: true
    });
    
    if (this._canvasService.canvasData) {
      this._canvas.loadFromJSON(this._canvasService.canvasData, () => {
        this._canvas.renderAll();
      });
    }

    this.addImageFromURL(this._screenshotService.subImage);
    
    this._canvas.on('mouse:wheel', (opt) => {
      let delta = opt.e.deltaY;
      let zoom = this._canvas!.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.5), 20);
      this._canvas!.setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    
    this._canvas.on('mouse:down', (opt) => {
      if (this.drawMode || opt.button !== 3) return;

      this.isPanning = true;
      this._canvas!.selection = false;
      this._canvas!.setCursor('grab');
    });

    this._canvas.on('mouse:move', (opt) => {
      if (this.isPanning && opt && opt.e) {
        const e = opt.e;
        const vpt = this._canvas!.viewportTransform!;
        vpt[4] += e.movementX;
        vpt[5] += e.movementY;
        this._canvas!.requestRenderAll();
      }
    });

    this._canvas.on('mouse:up', (opt) => {
      this.isPanning = false;
      this._canvas!.selection = true;
      this._canvas!.setCursor('default');
    });
    
    this._canvas!.on('mouse:up', (opt) => {
      //this.drawMode = false;
    });

    this._canvas.on('object:added', () => this.updateCanvasState());
    this._canvas.on('object:modified', () => this.updateCanvasState());
    
  }

  ngOnInit() {
    this._screenshotService.$screenshotUrl.subscribe(this.addImageFromURL);
  }

  addImageFromURL = (url: string) => {
    const i = new Image();
    i.src = url;
    
    i.onload = () => {
      const img = new fabric.Image(i);
      const images = this._canvas!.getObjects('image') as fabric.Image[];
      const last = images[images.length - 1];

      const top = last ? last.height! * last.scaleX! + last.top! + images.length * 5 + 5 : 0;
      
      const desiredWidth = window.innerWidth / 2;
      const scale = desiredWidth / img.width!;
      
      img.set({
        left: 5,
        top: top,
        angle: 0,
        opacity: 1,
        selectable: true, 
        evented: true,
        scaleX: scale,
        scaleY: scale
      });

      this._canvas!.add(img); 
      this.addButtonNearImage(img);
    }
    /*fabric.Image.fromURL(url, (img) => {
      console.log(this._canvas);
      const images = this._canvas!.getObjects('image') as fabric.Image[];
      const last = images[images.length - 1];

      const top = last ? last.height! * last.scaleX! + last.top! + images.length * 5 + 5 : 0;
      
      const desiredWidth = window.innerWidth / 2;
      const scale = desiredWidth / img.width!;
      
      img.set({
        left: 5,
        top: top,
        angle: 0,
        opacity: 1,
        selectable: true, 
        evented: true,
        scaleX: scale,
        scaleY: scale
      });

      this._canvas!.add(img); 
      //this.addButtonNearImage(img);
    });*/
  }
  
  addButtonNearImage(img: fabric.Image) {
    const buttonWidth = 30;
    const buttonHeight = 30;
  
    // Create a rectangle for the button background
    const buttonRect = new fabric.Rect({
      width: buttonWidth,
      height: buttonHeight,
      fill: '#007bff',
      rx: 5, // Rounded corners
      ry: 5,
      originX: 'center',
      originY: 'center'
    });
  
    // Create text for the button label
    const buttonText = new fabric.Text('+', {
      fontSize: 16,
      fill: '#ffffff',
      originX: 'center',
      originY: 'center'
    });
  
    // Group the rectangle and text together to form the button
    const button = new fabric.Group([buttonRect, buttonText], {
      left: img.left! + img.width! * img.scaleX! + 10, // Position to the right of the image
      top: img.top! + (img.height! * img.scaleY!) / 2, // Center vertically with the image
      selectable: true, 
      evented: true,
    });
  
    // Add the button to the canvas
    this._canvas!.add(button);
  
    // Add an event listener to handle button clicks
    button.on('mousedown', () => {
      console.log('Button clicked!');
      // Add any additional logic you need when the button is clicked
    });
  }

  updateCanvasState() {
    if (!this._undoStatus && !this._redoStatus) {
      const jsonData = this._canvas.toJSON();
      const canvasAsJson = JSON.stringify(jsonData);

      if (this._currentStateIndex < this._canvasState.length - 1) {
        const indexToBeInserted = this._currentStateIndex + 1;
        this._canvasState[indexToBeInserted] = canvasAsJson;
        this._canvasState = this._canvasState.slice(0, indexToBeInserted + 1);
      } else {
        this._canvasState.push(canvasAsJson);
      }

      this._currentStateIndex = this._canvasState.length - 1;
    }
  }

  undo() {
    if (this._currentStateIndex > 0) {
      this._undoStatus = true;
      this._canvas.loadFromJSON(this._canvasState[this._currentStateIndex - 1], () => {
        this._canvas.renderAll();
        this._undoStatus = false;
        this._currentStateIndex--;
      });
    }
  }

  redo() {
    if (this._currentStateIndex < this._canvasState.length - 1) {
      this._redoStatus = true;
      this._canvas.loadFromJSON(this._canvasState[this._currentStateIndex + 1], () => {
        this._canvas.renderAll();
        this._redoStatus = false;
        this._currentStateIndex++;
      });
    }
  }

  @HostListener('window:resize')
  resizeCanvas() {
    this._canvas!.setWidth(window.innerWidth);
    this._canvas!.setHeight(window.innerHeight);
    
    this._cdr.detectChanges();
  } 
  
  @HostListener('window:keydown', ['$event'])
  handleUndoRedo(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.undo();
    }
    if (event.ctrlKey && event.key === 'Z') {
      event.preventDefault();
      this.redo();
    }
    if (event.key === "Delete") {
      const activeObjects = this._canvas.getActiveObjects();
      if (activeObjects.length) {
        activeObjects.forEach((object) => {
          this._canvas.remove(object);
        });
        this._canvas.discardActiveObject();
        this._canvas.renderAll();
      }
    }
  }


  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    this._canvas!.isDrawingMode = this.drawMode;
    this.updateBrushSettings();
  }

  updateBrushColor(event: any) {
    this._canvas!.freeDrawingBrush.color = this.drawingColor;
  }

  updateBrushWidth(event: any) {
    this._canvas!.freeDrawingBrush.width = parseInt(this.drawingLineWidth.toString(), 10) || 1;
  } 
  private updateBrushSettings() {
    if (this._canvas!.freeDrawingBrush) {
      this._canvas!.freeDrawingBrush.color = this.drawingColor;
      this._canvas!.freeDrawingBrush.width = this.drawingLineWidth;
    }
  }

  applyZoom(): void {

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

  addReviewTextArea(event: MouseEvent) {
    if (!this.isAddingReview) return;

    const text = new fabric.Textbox('', {
      left: event.x,
      top: event.y,
      fontSize: this.fontSize, // Set a default font size
      fill: this.textColor, // Set a default text color
      width: 200 
    });
    
    this._canvas!.add(text);
    this._canvas!.setActiveObject(text);
    text.enterEditing();
    text.hiddenTextarea?.focus();

    text.on('editing:exited', () => {
      if (!text.text || text.text.trim() === '') {
        // If the textbox is empty after editing, remove it from the canvas
        this._canvas!.remove(text);
      }
    });

    this.isAddingReview = false;
  }

  exit() {
    if(this._isSaved) return;
  }

  saveCanvas() {
    const dataURL = this._canvas!.toDataURL({
      format: 'png',
      quality: 1.0,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas.png';
    link.click();
    this._isSaved = true;
  }

  addReview() {
    setTimeout(() => this.isAddingReview = true, 0);
  }
}
