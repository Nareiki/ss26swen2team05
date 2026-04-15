import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPlaceholder } from './map-placeholder';

describe('MapPlaceholder', () => {
  let component: MapPlaceholder;
  let fixture: ComponentFixture<MapPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(MapPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
