import { Routes } from '@angular/router';
import { CanvasComponent } from './canvas/canvas.component';
import { ScreenshotSelectorComponent } from './screenshot-selector/screenshot-selector.component';

export const CANVAS_PATH = "canvas";

export const routes: Routes = [ {
    title: "Canvas",
    path: CANVAS_PATH,
    component: CanvasComponent
}, {
    title: "ScreenShot",
    path: "",
    component: ScreenshotSelectorComponent
}];
