import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CanvasImage, CanvasText, ICanvasObject } from "../data/types";
import LayeredImage, { Pixel } from "../data/layeredImage";

@Injectable({
    providedIn: 'root'
})
export default class CanvasService {
    public _canvasObjectsSubject: BehaviorSubject<ICanvasObject[]> = new BehaviorSubject<ICanvasObject[]>([]);
    public get $canvasObjectsSubject() {
        return this._canvasObjectsSubject.asObservable();
    }

    public _canvasImages: BehaviorSubject<ICanvasObject<CanvasImage>[]> = new BehaviorSubject<ICanvasObject<CanvasImage>[]>([]);
    public get $canvasImages() {
        return this._canvasImages.asObservable();
    }

    public _canvasTexts: BehaviorSubject<ICanvasObject<CanvasText>[]> = new BehaviorSubject<ICanvasObject<CanvasText>[]>([]);
    public get $canvasTexts() {
        return this._canvasTexts.asObservable();
    }

    public canvasMatrix: LayeredImage = new LayeredImage();

    public initializeMatrix = (width: number, height: number) => {
        this.canvasMatrix = new LayeredImage(Array.from({ length: width }).map((_, y) => Array.from({ length: height }).map((_, x) => new Pixel(x, y))));
        console.log(this.canvasMatrix);
    }

    public addText = (text: string, x: number = 0, y: number = 0, font: number = 16) => {
        const textLines = text.split('\n');
        const textObject: ICanvasObject<CanvasText> = {
            boundaries: [{
                x: x, y: y
            }, {
                x: x + Math.max(...textLines.map(line => line.length)) * font * 0.553, y: y + textLines.length * font
            }],
            type: "TEXT",
            object: new CanvasText(text, x, y)
        };
        console.log(text, x, y, font, textObject)
        
        const prev = this._canvasObjectsSubject.getValue();
        prev.push(textObject);

        this._canvasObjectsSubject.next([...prev]);

        
        const prevTexts = this._canvasTexts.getValue();
        prevTexts.push(textObject);

        this._canvasTexts.next([...prevTexts]);
    }
    
    public addImage = (img: HTMLImageElement, x: number = 0, y: number = 0) => {
        const image: ICanvasObject<CanvasImage> = {
            boundaries: [{
                x: x, y: y
            }, {
                x: x + img.width, y: y + img.height
            }],
            type: "IMAGE",
            object: new CanvasImage(img, x, y)
        };

        const prev = this._canvasObjectsSubject.getValue();
        prev.push(image);

        this._canvasObjectsSubject.next([...prev]);

        
        const prevImages = this._canvasImages.getValue();
        prevImages.push(image);

        this._canvasImages.next([...prevImages]);
    }

    public getObjectByMouse = (x: number, y: number) => {
        const objects = this._canvasObjectsSubject.getValue();

        for(let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];

            if (obj.boundaries[0].x <= x &&
                obj.boundaries[0].y <= y &&
                obj.boundaries[1].x >= x &&
                obj.boundaries[1].y >= y
            ) {
                return obj;
            }
        }
        
        return undefined;
    }

    public calculateLinePixels = (startX: number, startY: number, endX: number, endY: number, lineWidth: number) => {
        const pixels = [];
        const halfLineWidth = Math.floor(lineWidth / 2);
    
        const minX = Math.min(startX, endX) - halfLineWidth;
        const maxX = Math.max(startX, endX) + halfLineWidth;
        const minY = Math.min(startY, endY) - halfLineWidth;
        const maxY = Math.max(startY, endY) + halfLineWidth;
    
        const dx = endX - startX;
        const dy = endY - startY;
    
        if (dx === 0) {
            for (let y = minY; y <= maxY; y++) {
                for (let x = startX - halfLineWidth; x <= startX + halfLineWidth; x++) {
                    pixels.push({ x, y });
                }
            }
        } else if (dy === 0) {
            for (let x = minX; x <= maxX; x++) {
                for (let y = startY - halfLineWidth; y <= startY + halfLineWidth; y++) {
                    pixels.push({ x, y });
                }
            }
        } else {
            const slope = dy / dx;
            const intercept = startY - slope * startX;
    
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const distance = Math.abs(slope * x - y + intercept) / Math.sqrt(slope * slope + 1);
                    if (distance <= halfLineWidth) {
                        pixels.push({ x, y });
                    }
                }
            }
        }
    
        return pixels;
    }
}