import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { MealCard } from '../../../home/models/meal-card.model';
import { MealCategoryService } from '../../../home/services/meal-category.service';

@Component({
  selector: 'app-recommendation-for-you',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ReusableCard],
  templateUrl: './recommendation-for-you.html',
  styleUrl: './recommendation-for-you.scss',
})
export class RecommendationForYou {
  private readonly mealCategoryService = inject(MealCategoryService);

  /** All recommendation cards from API */
  readonly cards = signal<MealCard[]>([]);

  /** Display only 3 cards for this section */
  readonly visibleCards = computed(() => this.cards().slice(0, 3));

  constructor() {
    this.mealCategoryService
      .getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe((categories) => {
        const mapped: MealCard[] = categories.map((category) => ({
          id: category.idCategory,
          titleKey: category.strCategory,
          image: category.strCategoryThumb,
          alt: category.strCategory,
        }));
        this.cards.set(mapped);
      });
  }
}
