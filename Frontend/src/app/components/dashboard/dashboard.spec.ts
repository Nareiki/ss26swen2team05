import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDashboardComponent } from './dashboard';

describe('Dashboard', () => {
  let component: TourDashboardComponent;
  let fixture: ComponentFixture<TourDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TourDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
