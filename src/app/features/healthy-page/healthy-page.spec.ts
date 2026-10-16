import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthyPage } from './healthy-page';
import { TranslationService } from '../../core/services/translation.service';

describe('HealthyPage', () => {
  let component: HealthyPage;
  let fixture: ComponentFixture<HealthyPage>;
  let httpTestingController: HttpTestingController;

  const filterUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php';

  const currentLangSignal = signal<'en' | 'ar'>('en');
  const directionSignal = signal<'ltr' | 'rtl'>('ltr');
  const isLoadingSignal = signal<boolean>(false);

  const mockTranslationService = {
    translate: vi.fn((key: string) => key),
    currentLang: currentLangSignal,
    direction: directionSignal,
    isLoading: isLoadingSignal,
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
  };

  const mockPastaMeals = {
    meals: Array.from({ length: 12 }, (_, i) => ({
      idMeal: `5290${i}`,
      strMeal: `Pasta Dish ${i + 1}`,
      strMealThumb: `https://www.themealdb.com/images/media/meals/pasta${i + 1}.jpg`,
    })),
  };

  const mockBreakfastMeals = {
    meals: Array.from({ length: 6 }, (_, i) => ({
      idMeal: `5280${i}`,
      strMeal: `Breakfast Dish ${i + 1}`,
      strMealThumb: `https://www.themealdb.com/images/media/meals/breakfast${i + 1}.jpg`,
    })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthyPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HealthyPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should initialize with dinner tab active and fetch Pasta meals', () => {
    const req = httpTestingController.expectOne(`${filterUrl}?c=Pasta`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPastaMeals);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.activeTabId()).toBe('dinner');
    expect(component.mealCards().length).toBe(12);
    // Page contains exactly 6 cards
    expect(component.visibleCards().length).toBe(6);
    expect(component.pages().length).toBe(2);
  });

  it('should render exactly 6 card components in the grid', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-reusable-card');
    expect(cards.length).toBe(6);
  });

  it('should render 3 filter buttons with Dinner marked active', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.healthy-page__filter-btn'),
    );
    expect(buttons.length).toBe(3);

    // Active button corresponds to dinner
    const activeBtn = fixture.nativeElement.querySelector(
      '.healthy-page__filter-btn--active',
    );
    expect(activeBtn).toBeTruthy();
    expect(activeBtn.textContent).toContain('SECTION_TITLE.HEALTHY.FILTER_DINNER');
  });

  it('should paginate to page 1 on dot click and display the next 6 cards', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const dots: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.healthy-page__dot'),
    );
    expect(dots.length).toBe(2);
    expect(dots[0].classList.contains('healthy-page__dot--active')).toBe(true);

    // Click second dot
    dots[1].click();
    fixture.detectChanges();

    expect(component.activeIndex()).toBe(1);
    expect(component.visibleCards().length).toBe(6);
    expect(component.visibleCards()[0].titleKey).toBe('Pasta Dish 7');
    expect(dots[1].classList.contains('healthy-page__dot--active')).toBe(true);
  });

  it('should switch tab to Breakfast, reset page index, and fetch Breakfast meals', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.healthy-page__filter-btn'),
    );
    // Click Breakfast tab (index 0)
    buttons[0].click();

    const req = httpTestingController.expectOne(`${filterUrl}?c=Breakfast`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBreakfastMeals);
    fixture.detectChanges();

    expect(component.activeTabId()).toBe('breakfast');
    expect(component.activeIndex()).toBe(0);
    expect(component.mealCards().length).toBe(6);
    expect(component.visibleCards().length).toBe(6);
  });

  it('should reuse in-memory cache when switching back to Dinner', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.healthy-page__filter-btn'),
    );
    // Switch to Breakfast
    buttons[0].click();
    httpTestingController.expectOne(`${filterUrl}?c=Breakfast`).flush(mockBreakfastMeals);
    fixture.detectChanges();

    // Switch back to Dinner (index 2)
    buttons[2].click();
    // No HTTP request should be triggered due to caching
    httpTestingController.expectNone(`${filterUrl}?c=Pasta`);
    fixture.detectChanges();

    expect(component.activeTabId()).toBe('dinner');
    expect(component.mealCards().length).toBe(12);
  });

  it('should handle API errors gracefully by clearing cards and resetting loading', () => {
    const req = httpTestingController.expectOne(`${filterUrl}?c=Pasta`);
    req.error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.mealCards().length).toBe(0);
    expect(component.visibleCards().length).toBe(0);
  });

  it('should render the language and theme switcher widget', () => {
    httpTestingController.expectOne(`${filterUrl}?c=Pasta`).flush(mockPastaMeals);
    fixture.detectChanges();

    const switcher = fixture.nativeElement.querySelector('app-language-switcher');
    expect(switcher).toBeTruthy();
  });
});
