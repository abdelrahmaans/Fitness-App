import { TestBed } from '@angular/core/testing';

import { MealDetails } from './meal-details';

describe('MealDetails', () => {
  let service: MealDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
