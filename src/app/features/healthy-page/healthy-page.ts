import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../shared/ui/reusable-card/reusable-card';
import { SectionTitle } from '../../shared/ui/section-title/section-title';
import { MealCategoryService } from '../home/services/meal-category.service';
import {
  HEALTHY_PAGE_MEALS_PER_PAGE,
  MEAL_FILTER_TABS,
  MealCard,
  MealFilterTab,
} from './models/healthy-page.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-healthy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitle, ReusableCard, TranslatePipe, LanguageSwitcher],
  templateUrl: './healthy-page.html',
  styleUrl: './healthy-page.scss',
})
export class HealthyPage {
  private readonly mealCategoryService = inject(MealCategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  /** Filter tabs matching Figma: Breakfast, Lunch, Dinner */
  readonly filterTabs = MEAL_FILTER_TABS;

  /** Active filter tab ID, defaulting to 'dinner' as shown in the design mockup */
  readonly activeTabId = signal<string>('dinner');

  /** All fetched meal cards for the active category */
  readonly mealCards = signal<MealCard[]>([]);

  /** Current page index for 6-card pagination */
  readonly activeIndex = signal<number>(0);

  /** Loading state indicator */
  readonly isLoading = signal<boolean>(false);

  /** In-memory cache for category meals to avoid redundant network calls */
  private readonly mealsCache = new Map<string, MealCard[]>();

  /** Cards visible on current page (up to 6 cards in a 3x2 grid) */
  readonly visibleCards = computed<MealCard[]>(() => {
    const cards = this.mealCards();
    const start = this.activeIndex() * HEALTHY_PAGE_MEALS_PER_PAGE;
    return cards.slice(start, start + HEALTHY_PAGE_MEALS_PER_PAGE);
  });

  /** Page indices computed from total cards */
  readonly pages = computed<number[]>(() => {
    const totalPages = Math.ceil(this.mealCards().length / HEALTHY_PAGE_MEALS_PER_PAGE);
    return Array.from({ length: totalPages }, (_, i) => i);
  });

  constructor() {
    const defaultTab = this.filterTabs.find((t) => t.id === 'dinner') ?? this.filterTabs[0];
    this.selectTab(defaultTab);
  }

  /** Switches the active meal tab and fetches corresponding meals */
  selectTab(tab: MealFilterTab): void {
    this.activeTabId.set(tab.id);
    this.activeIndex.set(0);

    if (this.mealsCache.has(tab.apiCategory)) {
      this.mealCards.set(this.mealsCache.get(tab.apiCategory)!);
      return;
    }

    this.isLoading.set(true);
    this.mealCategoryService
      .getMealsByCategory(tab.apiCategory)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (meals) => {
          const cards: MealCard[] = (meals || []).map((meal) => ({
            id: meal.idMeal,
            titleKey: meal.strMeal,
            image: meal.strMealThumb,
            alt: meal.strMeal,
          }));
          this.mealsCache.set(tab.apiCategory, cards);
          this.mealCards.set(cards);
          this.isLoading.set(false);
        },
        error: () => {
          this.mealCards.set([]);
          this.isLoading.set(false);
        },
      });
  }

  /** Switches to the selected page */
  setPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.pages().length) {
      this.activeIndex.set(pageIndex);
    }
  }

      onCardClick(card: MealCard): void {
      if (card.id) {
        this.router.navigate(['/meals', card.id]);
      }

    }
}
