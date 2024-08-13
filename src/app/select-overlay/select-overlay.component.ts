import { Component } from '@angular/core';

@Component({
  selector: 'app-select-overlay',
  templateUrl: './select-overlay.component.html',
  styleUrl: './select-overlay.component.scss'
})
export class SelectOverlayComponent {
  private _startPosition: { x: number, y: number } | undefined = undefined;
  private _endPosition: { x: number, y: number } | undefined = undefined;
  private _isSelecting: boolean = false;

  public get selectAreaStyles() {
    if (!this._startPosition || !this._endPosition) return { display: 'none' };

    return {
      top: `${this._startPosition.y}px`,
      left: `${this._startPosition.x}px`,
      height: `${this._endPosition.y - this._startPosition.y}px`,
      width: `${this._endPosition.x - this._startPosition.x}px`
    };
  }

  public startSelection = (event: MouseEvent) => {
    this._isSelecting = true;
    this._startPosition = { 
      x: event.offsetX, 
      y: event.offsetY 
    };
    this._endPosition = { 
      x: event.offsetX, 
      y: event.offsetY 
    };
  }

  public moveSelection = (event: MouseEvent) => {
    if (!this._isSelecting) return;
    
    this._endPosition = { 
      x: event.offsetX, 
      y: event.offsetY
    };
    
    if (this._endPosition!.x < this._startPosition!.x) {
      this._endPosition!.x = [this._startPosition!.x, this._startPosition!.x = this._endPosition!.x][0];
    }
    
    if (this._endPosition!.y < this._startPosition!.y) {
      this._endPosition!.y = [this._startPosition!.y, this._startPosition!.y = this._endPosition!.y][0];
    }
  }

  public endSelection = () => {
    this._isSelecting = false;
  }
}
