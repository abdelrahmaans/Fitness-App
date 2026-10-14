import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { MealCard } from '../../models/meal-card.model';
import { MealCategoryService } from '../../services/meal-category.service';

@Component({
  selector: 'app-healthy-nutrition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitle, ReusableCard, TranslatePipe],
  templateUrl: './healthy-nutrition.html',
  styleUrl: './healthy-nutrition.scss',
})
export class HealthyNutrition {
  private readonly mealCategoryService = inject(MealCategoryService);
  
  readonly mealCards = signal<MealCard[]>([]);
  readonly activeIndex = signal(0);
  readonly itemsPerPage = 3;
  readonly showAllOnMobile = signal(false);

  readonly visibleCards = computed(() => {
    if (this.showAllOnMobile()) {
      return this.mealCards();
    }
    const start = this.activeIndex() * this.itemsPerPage;
    return this.mealCards().slice(start, start + this.itemsPerPage);
  });

  readonly pages = computed(() => {
    const totalPages = Math.ceil(this.mealCards().length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i);
  });

  constructor() {
    this.mealCategoryService.getCategories().pipe(
      takeUntilDestroyed()
    ).subscribe(categories => {
      // Map API categories to our MealCard model
      const cards = categories.map(category => ({
        id: category.idCategory,
        titleKey: category.strCategory,
        image: category.strCategoryThumb,
        alt: category.strCategory,
      }));
      this.mealCards.set(cards);
    });
  }
}
