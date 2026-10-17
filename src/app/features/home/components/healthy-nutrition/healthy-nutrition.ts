import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { MAX_MEALS_PER_CATEGORY, MEALS_PER_PAGE, MealCard } from '../../models/meal-card.model';
import { MealCategory } from '../../models/meal-category.model';
import { MealCategoryService } from '../../services/meal-category.service';

@Component({
  selector: 'app-healthy-nutrition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitle, ReusableCard, TranslatePipe, LucideChevronLeft, LucideChevronRight],
  templateUrl: './healthy-nutrition.html',
  styleUrl: './healthy-nutrition.scss',
})
export class HealthyNutrition {
  private readonly mealCategoryService = inject(MealCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryTrack = viewChild<ElementRef<HTMLElement>>('categoryTrack');

  /** All meal categories loaded from TheMealDB API (categories.php) */
  readonly categories = signal<MealCategory[]>([]);

  /** Currently selected category name ('Dessert' by default as shown in design) */
  readonly activeCategory = signal<string>('Dessert');

  /** Meal cards for the selected category */
  readonly mealCards = signal<MealCard[]>([]);

  /** Loading state during category meal fetches */
  readonly isLoading = signal<boolean>(false);

  /** In-memory cache for category meals to provide instant switching */
  private readonly mealsCache = new Map<string, MealCard[]>();

  readonly activeIndex = signal(0);
  readonly itemsPerPage = MEALS_PER_PAGE;
  readonly showAllOnMobile = signal(false);

  readonly visibleCards = computed(() => {
    const cards = this.mealCards();
    if (this.showAllOnMobile()) {
      return cards;
    }
    const start = this.activeIndex() * this.itemsPerPage;
    return cards.slice(start, start + this.itemsPerPage);
  });

  readonly pages = computed(() => {
    const totalPages = Math.ceil(this.mealCards().length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i);
  });

  constructor() {
    this.mealCategoryService
      .getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe((categories) => {
        this.categories.set(categories);
        if (categories.length > 0) {
          const defaultCat = categories.some((c) => c.strCategory === 'Dessert')
            ? 'Dessert'
            : categories[0].strCategory;
          this.selectCategory(defaultCat);
        }
      });
  }

  /** Selects a category and fetches its meals from TheMealDB API */
  selectCategory(categoryName: string): void {
    this.activeCategory.set(categoryName);
    this.activeIndex.set(0);
    this.showAllOnMobile.set(false);

    if (this.mealsCache.has(categoryName)) {
      this.mealCards.set(this.mealsCache.get(categoryName)!);
      return;
    }

    this.isLoading.set(true);
    this.mealCategoryService
      .getMealsByCategory(categoryName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (meals) => {
          const featured = (meals || []).slice(0, MAX_MEALS_PER_CATEGORY);
          const cards: MealCard[] = featured.map((meal) => ({
            id: meal.idMeal,
            titleKey: meal.strMeal,
            image: meal.strMealThumb,
            alt: meal.strMeal,
          }));
          this.mealsCache.set(categoryName, cards);
          this.mealCards.set(cards);
          this.isLoading.set(false);
        },
        error: () => {
          this.mealCards.set([]);
          this.isLoading.set(false);
        },
      });
  }

  /** Selects a pagination page index */
  setPage(pageIndex: number): void {
    this.activeIndex.set(pageIndex);
  }

  /** Smoothly scrolls the category track horizontally */
  scrollCategories(direction: 'left' | 'right'): void {
    const el = this.categoryTrack()?.nativeElement;
    if (el) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
