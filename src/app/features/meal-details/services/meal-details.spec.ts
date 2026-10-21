import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MealDetailsService } from './meal-details';

describe('MealDetailsService', () => {
  let service: MealDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MealDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
