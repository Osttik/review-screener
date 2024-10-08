import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { routes } from './app.routes';
import { ScreenshotSelectorComponent } from './screenshot-selector/screenshot-selector.component';
import { SelectOverlayComponent } from './select-overlay/select-overlay.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ScreenshotSelectorComponent,
    SelectOverlayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule 
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgxElectronModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
