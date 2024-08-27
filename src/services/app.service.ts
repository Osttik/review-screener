import { Injectable } from "@angular/core";
import ScreenshotService from "./screenshot.service";
import { IPCRenderer } from "../server";
import { Router } from "@angular/router";
import { CANVAS_PATH } from "../app/app.routes";
import CanvasService from "./canvas.service";

export const APP_OPEN_BUS = 'app-open';
export const APP_NAVIGATE_TO_CANVAS = 'navigate-to-canvas';

@Injectable({
    providedIn: 'root'
})
export default class AppService {
    constructor(
        private _screenshotServie: ScreenshotService,
        private _router: Router,
        private _canvasService: CanvasService
    ) {

    }
    
    public registerListeners = () => {
        IPCRenderer.on(APP_OPEN_BUS, (event) => {
            this._screenshotServie.requestScreenshot();
        });
        
        IPCRenderer.on(APP_NAVIGATE_TO_CANVAS, (event, canvas) => {
            this._canvasService.canvasData = canvas;
            this._router.navigate([`/${CANVAS_PATH}`]);
        });
    }
}