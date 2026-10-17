import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthyNutrition } from './healthy-nutrition';
import { TranslationService } from '../../../../core/services/translation.service';

describe('HealthyNutrition', () => {
  let component: HealthyNutrition;
  let fixture: ComponentFixture<HealthyNutrition>;
  let httpTestingController: HttpTestingController;

  const categoriesUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';
  const filterUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php';

  const mockTranslationService = {
    translate: vi.fn((key: string) => key),
  };

  const mockCategories = {
    categories: [
      { idCategory: '1', strCategory: 'Beef', strCategoryThumb: 'beef.png' },
      { idCategory: '2', strCategory: 'Chicken', strCategoryThumb: 'chicken.png' },
      { idCategory: '3', strCategory: 'Dessert', strCategoryThumb: 'dessert.png' },
      { idCategory: '4', strCategory: 'Lamb', strCategoryThumb: 'lamb.png' },
    ],
  };

  const mockDessertMeals = {
    meals: [
      { idMeal: '52855', strMeal: 'Banana Pancakes', strMealThumb: 'pancakes.jpg' },
      { idMeal: '52856', strMeal: 'Apple Pie', strMealThumb: 'pie.jpg' },
      { idMeal: '52857', strMeal: 'Pumpkin Pie', strMealThumb: 'pumpkin.jpg' },
      { idMeal: '52858', strMeal: 'Chocolate Cake', strMealThumb: 'cake.jpg' },
    ],
  };

  const mockBeefMeals = {
    meals: [
      { idMeal: '52870', strMeal: 'Beef Bourguignon', strMealThumb: 'beef1.jpg' },
      { idMeal: '52871', strMeal: 'Beef Steak', strMealThumb: 'beef2.jpg' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthyNutrition],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HealthyNutrition);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and fetch categories, defaulting to Dessert', () => {
    // 1. Initial categories request
    const catReq = httpTestingController.expectOne(categoriesUrl);
    expect(catReq.request.method).toBe('GET');
    catReq.flush(mockCategories);

    // 2. Automated Dessert meal fetch on initialization
    const mealReq = httpTestingController.expectOne(`${filterUrl}?c=Dessert`);
    expect(mealReq.request.method).toBe('GET');
    mealReq.flush(mockDessertMeals);

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.categories().length).toBe(4);
    expect(component.activeCategory()).toBe('Dessert');
    expect(component.mealCards().length).toBe(4);
    expect(component.visibleCards().length).toBe(3);
    expect(component.pages().length).toBe(2);
  });

  it('should render all category buttons and mark Dessert as active', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.healthy-nutrition__filter-btn');
    expect(buttons.length).toBe(4);
    expect(buttons[0].textContent.trim()).toBe('Beef');
    expect(buttons[1].textContent.trim()).toBe('Chicken');
    expect(buttons[2].textContent.trim()).toBe('Dessert');
    expect(buttons[3].textContent.trim()).toBe('Lamb');

    // Dessert (index 2) is active
    expect(buttons[2].classList.contains('healthy-nutrition__filter-btn--active')).toBe(true);
    expect(buttons[0].classList.contains('healthy-nutrition__filter-btn--active')).toBe(false);
  });

  it('should switch category, fetch its meals, and reset activeIndex on selectCategory', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    component.activeIndex.set(1);
    component.showAllOnMobile.set(true);

    component.selectCategory('Beef');

    // Verify loading state
    expect(component.isLoading()).toBe(true);
    expect(component.activeCategory()).toBe('Beef');
    expect(component.activeIndex()).toBe(0);
    expect(component.showAllOnMobile()).toBe(false);

    // Flush Beef meals
    const beefReq = httpTestingController.expectOne(`${filterUrl}?c=Beef`);
    beefReq.flush(mockBeefMeals);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.mealCards().length).toBe(2);
    expect(component.mealCards()[0].titleKey).toBe('Beef Bourguignon');
    expect(component.visibleCards().length).toBe(2);
  });

  it('should use in-memory cache when selecting a previously loaded category', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    // Select Beef
    component.selectCategory('Beef');
    httpTestingController.expectOne(`${filterUrl}?c=Beef`).flush(mockBeefMeals);
    fixture.detectChanges();
    expect(component.mealCards().length).toBe(2);

    // Switch back to Dessert - should NOT fire another HTTP request
    component.selectCategory('Dessert');
    httpTestingController.expectNone(`${filterUrl}?c=Dessert`);
    expect(component.mealCards().length).toBe(4);
    expect(component.mealCards()[0].titleKey).toBe('Banana Pancakes');
  });

  it('should switch category on button click in template', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.healthy-nutrition__filter-btn');
    buttons[0].click(); // Click Beef button

    const beefReq = httpTestingController.expectOne(`${filterUrl}?c=Beef`);
    beefReq.flush(mockBeefMeals);
    fixture.detectChanges();

    expect(component.activeCategory()).toBe('Beef');
    expect(buttons[0].classList.contains('healthy-nutrition__filter-btn--active')).toBe(true);
    expect(buttons[2].classList.contains('healthy-nutrition__filter-btn--active')).toBe(false);
  });

  it('should support horizontal track scrolling', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    const trackEl = component.categoryTrack()?.nativeElement;
    if (trackEl) {
      const scrollSpy = vi.fn();
      trackEl.scrollBy = scrollSpy;

      component.scrollCategories('right');
      expect(scrollSpy).toHaveBeenCalledWith({ left: 260, behavior: 'smooth' });

      component.scrollCategories('left');
      expect(scrollSpy).toHaveBeenCalledWith({ left: -260, behavior: 'smooth' });
    }
  });

  it('should paginate visible cards and support showAllOnMobile', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    // 4 dessert cards: page 0 has 3, page 1 has 1
    expect(component.visibleCards().length).toBe(3);
    expect(component.visibleCards()[0].titleKey).toBe('Banana Pancakes');

    component.setPage(1);
    expect(component.visibleCards().length).toBe(1);
    expect(component.visibleCards()[0].titleKey).toBe('Chocolate Cake');

    component.showAllOnMobile.set(true);
    expect(component.visibleCards().length).toBe(4);
  });

  it('should render pagination dots matching filtered items and update page on dot click', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.healthy-nutrition__dot');
    expect(dots.length).toBe(2);
    expect(dots[0].classList.contains('healthy-nutrition__dot--active')).toBe(true);
    expect(dots[1].classList.contains('healthy-nutrition__dot--active')).toBe(false);

    // Click second dot
    dots[1].click();
    fixture.detectChanges();

    expect(component.activeIndex()).toBe(1);
    expect(dots[1].classList.contains('healthy-nutrition__dot--active')).toBe(true);
    expect(dots[0].classList.contains('healthy-nutrition__dot--active')).toBe(false);
  });

  it('should hide pagination dots when filtered category has 3 or fewer meals', () => {
    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.healthy-nutrition__dot').length).toBe(2);

    // Switch to Beef (2 items)
    component.selectCategory('Beef');
    httpTestingController.expectOne(`${filterUrl}?c=Beef`).flush(mockBeefMeals);
    fixture.detectChanges();

    expect(component.pages().length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.healthy-nutrition__dot').length).toBe(0);
  });

  it('should cap meals to MAX_MEALS_PER_CATEGORY (6) to maintain clean 2-page carousel pagination', () => {
    const tenMeals = {
      meals: Array.from({ length: 10 }, (_, i) => ({
        idMeal: `${52000 + i}`,
        strMeal: `Meal ${i + 1}`,
        strMealThumb: `meal${i + 1}.jpg`,
      })),
    };

    httpTestingController.expectOne(categoriesUrl).flush(mockCategories);
    httpTestingController.expectOne(`${filterUrl}?c=Dessert`).flush(mockDessertMeals);
    fixture.detectChanges();

    component.selectCategory('Chicken');
    httpTestingController.expectOne(`${filterUrl}?c=Chicken`).flush(tenMeals);
    fixture.detectChanges();

    expect(component.mealCards().length).toBe(6);
    expect(component.pages().length).toBe(2);
    const dots = fixture.nativeElement.querySelectorAll('.healthy-nutrition__dot');
    expect(dots.length).toBe(2);
  });
});
