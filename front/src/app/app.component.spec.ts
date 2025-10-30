import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
      { provide: ActivatedRoute, useValue: {} }
    ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    
        fixture.detectChanges();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
