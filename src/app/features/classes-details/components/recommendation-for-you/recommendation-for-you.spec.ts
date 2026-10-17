import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { RecommendationForYou } from './recommendation-for-you';
import { MealCategoryService } from '../../../home/services/meal-category.service';

const mockCategories = [
  {
    idCategory: '1',
    strCategory: 'Chicken',
    strCategoryThumb: 'https://www.themealdb.com/images/category/chicken.png',
    strCategoryDescription: 'Chicken dishes',
  },
  {
    idCategory: '2',
    strCategory: 'Dessert',
    strCategoryThumb: 'https://www.themealdb.com/images/category/dessert.png',
    strCategoryDescription: 'Dessert dishes',
  },
];

describe('RecommendationForYou', () => {
  let component: RecommendationForYou;
  let fixture: ComponentFixture<RecommendationForYou>;
  let mealCategoryServiceMock: { getCategories: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mealCategoryServiceMock = {
      getCategories: vi.fn().mockReturnValue(of(mockCategories)),
    };

    await TestBed.configureTestingModule({
      imports: [RecommendationForYou],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MealCategoryService, useValue: mealCategoryServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecommendationForYou);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with Figma meal cards and append API categories', () => {
    expect(mealCategoryServiceMock.getCategories).toHaveBeenCalled();
    const cards = component.cards();
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(cards[0].titleKey).toBe('MEAL_CARD.BREAKFAST');
    expect(cards[1].titleKey).toBe('MEAL_CARD.LUNCH');
    expect(cards[2].titleKey).toBe('MEAL_CARD.DINNER');
  });

  it('should render the section heading and navigation buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector('.recommendation__heading');
    const prevBtn = el.querySelector('.recommendation__scroll-btn--prev');
    const nextBtn = el.querySelector('.recommendation__scroll-btn--next');

    expect(heading).toBeTruthy();
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
  });

  it('should invoke scrollBy when scroll is called', () => {
    const navEl = component.viewport()?.nativeElement;
    if (navEl) {
      navEl.scrollBy = vi.fn();
      component.scroll('next');
      expect(navEl.scrollBy).toHaveBeenCalled();
    }
  });

  it('should update canScrollPrev and canScrollNext state', () => {
    const navEl = component.viewport()?.nativeElement;
    if (navEl) {
      Object.defineProperty(navEl, 'scrollWidth', { value: 1200, configurable: true });
      Object.defineProperty(navEl, 'clientWidth', { value: 600, configurable: true });
      Object.defineProperty(navEl, 'scrollLeft', { value: 100, configurable: true });

      component.updateScrollState();

      expect(component.canScrollPrev()).toBe(true);
      expect(component.canScrollNext()).toBe(true);
    }
  });

  it('should handle keyboard arrow events', () => {
    const spy = vi.spyOn(component, 'scroll');
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(eventRight);
    expect(spy).toHaveBeenCalledWith('next');

    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.onKeyDown(eventLeft);
    expect(spy).toHaveBeenCalledWith('prev');
  });
});
