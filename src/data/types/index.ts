import { Point } from "electron";

export interface ICanvasObject<T = any> {
    boundaries: [Point, Point];
    type: string;
    object: T;
}

export class CanvasImage {
    constructor(public img: HTMLImageElement, public x: number, public y: number, public isDragging: boolean = false)  {}
}

export class CanvasText {
    constructor(public text: string, public x: number, public y: number, public isDragging: boolean = false)  {}
}