import { Injectable } from "@angular/core";
import ScreenshotService from "./screenshot.service";
import { IPCRenderer } from "../server";

export const APP_OPEN_BUS = 'app-open';

@Injectable({
    providedIn: 'root'
})
export default class AppService {
    constructor(private _screenshotServie: ScreenshotService) {

    }
    
    public registerListeners = () => {
        IPCRenderer.on(APP_OPEN_BUS, (event) => {
            this._screenshotServie.requestScreenshot();
        });
    }
}