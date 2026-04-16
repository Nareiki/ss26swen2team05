import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourForm } from './tour-form';

describe('TourForm', () => {
  let component: TourForm;
  let fixture: ComponentFixture<TourForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TourForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
