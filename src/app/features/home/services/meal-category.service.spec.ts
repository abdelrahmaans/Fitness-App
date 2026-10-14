import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MealCategoryResponse } from '../models/meal-category.model';
import { MealCategoryService } from './meal-category.service';

describe('MealCategoryService', () => {
  let service: MealCategoryService;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MealCategoryService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MealCategoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch categories and return them', () => {
    const mockResponse: MealCategoryResponse = {
      categories: [
        {
          idCategory: '1',
          strCategory: 'Beef',
          strCategoryThumb: 'https://example.com/beef.png',
        },
        {
          idCategory: '2',
          strCategory: 'Chicken',
          strCategoryThumb: 'https://example.com/chicken.png',
        },
      ],
    };

    service.getCategories().subscribe((categories) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBe(2);
      expect(categories[0].strCategory).toBe('Beef');
      expect(categories[1].idCategory).toBe('2');
    });

    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return empty array if categories is undefined', () => {
    const mockResponse = {} as MealCategoryResponse;

    service.getCategories().subscribe((categories) => {
      expect(categories).toEqual([]);
    });

    const req = httpTestingController.expectOne(apiUrl);
    req.flush(mockResponse);
  });
});
