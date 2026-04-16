import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourLogForm } from './tour-log-form';

describe('TourLogForm', () => {
  let component: TourLogForm;
  let fixture: ComponentFixture<TourLogForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourLogForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TourLogForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
