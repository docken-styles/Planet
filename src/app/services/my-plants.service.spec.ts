import { TestBed } from '@angular/core/testing';

import { MyPlantsService } from './my-plants.service';

describe('MyPlantsService', () => {
  let service: MyPlantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyPlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
