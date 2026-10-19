import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MealCategoryResponse, MealItemsResponse } from '../models/meal-category.model';
import { MealCategoryService } from './meal-category.service';

describe('MealCategoryService', () => {
  let service: MealCategoryService;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';
  const filterApiUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php';

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

  it('should fetch meals by category and return them', () => {
    const mockMealsResponse: MealItemsResponse = {
      meals: [
        {
          idMeal: '52855',
          strMeal: 'Banana Pancakes',
          strMealThumb: 'https://example.com/pancakes.jpg',
        },
        {
          idMeal: '52856',
          strMeal: 'Apple Pie',
          strMealThumb: 'https://example.com/pie.jpg',
        },
      ],
    };

    service.getMealsByCategory('Dessert').subscribe((meals) => {
      expect(meals).toBeTruthy();
      expect(meals.length).toBe(2);
      expect(meals[0].strMeal).toBe('Banana Pancakes');
      expect(meals[1].idMeal).toBe('52856');
    });

    const req = httpTestingController.expectOne(`${filterApiUrl}?c=Dessert`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMealsResponse);
  });

  it('should return empty array if meals is null or error occurs', () => {
    const mockMealsResponse = { meals: null };

    service.getMealsByCategory('NonExistent').subscribe((meals) => {
      expect(meals).toEqual([]);
    });

    const req = httpTestingController.expectOne(`${filterApiUrl}?c=NonExistent`);
    req.flush(mockMealsResponse);
  });
});
