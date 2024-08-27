import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export default class CanvasService {
    public canvasData: any | null = null;
}