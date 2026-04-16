import { TestBed } from '@angular/core/testing';

import { TourLog } from './tour-log';

describe('TourLog', () => {
  let service: TourLog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourLog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
