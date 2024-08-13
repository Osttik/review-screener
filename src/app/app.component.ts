import { Component } from '@angular/core';
import ScreenshotService from '../services/screenshot.service';
import AppService from '../services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private _screenshotService: ScreenshotService,
    private _appService: AppService
  ) {
    this._screenshotService.registerListeners();
    this._appService.registerListeners();
  }
}
