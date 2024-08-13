import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { IPCRenderer } from "../server";
import { Router } from "@angular/router";
import { CANVAS_PATH } from "../app/app.routes";

export const SCREENSHOT_CAPTURED_BUS = 'screenshot-captured';
export const SCREENSHOT_CAPTURE_BUS = 'capture-screen';
export const SCREENSHOT_SUBIMAGE_BUS = 'add-image';

@Injectable({
    providedIn: 'root'
})
export default class ScreenshotService {
    private _screenshotUrlSubject: Subject<string> = new Subject<string>();
    public $screenshotUrl: Observable<string> = this._screenshotUrlSubject.asObservable();
    public screenshotUrlRawValue: string = '';

    public subImage: string = '';

    constructor(private _router: Router) {}

    public registerListeners = () => {
        IPCRenderer.on(SCREENSHOT_CAPTURED_BUS, (event, screenshotPath) => {
            this.screenshotUrlRawValue = screenshotPath;
            this._screenshotUrlSubject.next(screenshotPath);
        });

        IPCRenderer.on(SCREENSHOT_CAPTURE_BUS, (event) => {
            this.requestScreenshot();
        });

        IPCRenderer.on(SCREENSHOT_SUBIMAGE_BUS, (event, url) => {
            this.subImage = url;
            this._router.navigate([`/${CANVAS_PATH}`]);
        });
    }

    public requestScreenshot = () => {
        IPCRenderer.send(SCREENSHOT_CAPTURE_BUS);

        return this.$screenshotUrl;
    }
}