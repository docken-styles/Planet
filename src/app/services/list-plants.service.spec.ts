import { TestBed } from '@angular/core/testing';

import { ListPlantsService } from './list-plants.service';

describe('ListPlantsService', () => {
  let service: ListPlantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListPlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
