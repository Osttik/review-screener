import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotSelectorComponent } from './screenshot-selector.component';

describe('ScreenshotSelectorComponent', () => {
  let component: ScreenshotSelectorComponent;
  let fixture: ComponentFixture<ScreenshotSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenshotSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenshotSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
