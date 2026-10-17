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
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { MealCard } from '../../../home/models/meal-card.model';
import { MealCategoryService } from '../../../home/services/meal-category.service';
import { Router } from '@angular/router';

/** Curated initial meal plans matching Figma design with high-resolution assets */
const FIGMA_MEALS: readonly MealCard[] = [
  {
    id: 'meal-breakfast',
    titleKey: 'MEAL_CARD.BREAKFAST',
    image: '/images/healthy-1.webp',
    alt: 'MEAL_CARD.BREAKFAST',
  },
  {
    id: 'meal-lunch',
    titleKey: 'MEAL_CARD.LUNCH',
    image: '/images/healthy-2.webp',
    alt: 'MEAL_CARD.LUNCH',
  },
  {
    id: 'meal-dinner',
    titleKey: 'MEAL_CARD.DINNER',
    image: '/images/healthy-3.webp',
    alt: 'MEAL_CARD.DINNER',
  },
];

@Component({
  selector: 'app-recommendation-for-you',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ReusableCard, LucideChevronLeft, LucideChevronRight],
  templateUrl: './recommendation-for-you.html',
  styleUrl: './recommendation-for-you.scss',
})
export class RecommendationForYou {
  private readonly mealCategoryService = inject(MealCategoryService);
  private readonly translationService = inject(TranslationService, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  /** Viewport element for scrolling cards */
  readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');

  /** Scroll handle availability states */
  readonly canScrollPrev = signal<boolean>(false);
  readonly canScrollNext = signal<boolean>(true);

  /** All recommendation cards initialized with Figma meals, then extended with API categories */
  readonly cards = signal<MealCard[]>([...FIGMA_MEALS]);

  /** Backward-compatible computed property returning all cards */
  readonly visibleCards = computed(() => this.cards());

  /** Starting X position for touch swipe gestures */
  private touchStartX = 0;

  constructor() {
    this.mealCategoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          const apiMeals: MealCard[] = categories
            .filter((c) => !['Breakfast'].includes(c.strCategory))
            .map((category) => ({
              id: category.idCategory,
              titleKey: category.strCategory,
              image: category.strCategoryThumb,
              alt: category.strCategory,
            }));
          this.cards.set([...FIGMA_MEALS, ...apiMeals]);
          this.scheduleScrollUpdate();
        },
        error: () => {
          this.cards.set([...FIGMA_MEALS]);
        },
      });
  }

  /** Smoothly scrolls the carousel track by one card width */
  scroll(direction: 'prev' | 'next'): void {
    const el = this.viewport()?.nativeElement;
    if (!el) return;
    const cardEl = el.querySelector('.recommendation__card-item') as HTMLElement | null;
    const gap = 20;
    const cardWidth = cardEl ? cardEl.offsetWidth + gap : 340;
    const isRtl = this.translationService?.direction() === 'rtl';
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;
    const delta = isRtl ? -scrollAmount : scrollAmount;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: delta, behavior: 'smooth' });
    }
    this.scheduleScrollUpdate();
  }

  /** Updates prev/next scroll handle availability based on current scroll position */
  updateScrollState(): void {
    const el = this.viewport()?.nativeElement;
    if (!el) return;
    const isRtl = this.translationService?.direction() === 'rtl';
    const tolerance = 6;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= tolerance) {
      this.canScrollPrev.set(false);
      this.canScrollNext.set(false);
      return;
    }
    const currentScroll = Math.abs(el.scrollLeft);
    if (isRtl) {
      this.canScrollNext.set(currentScroll > tolerance);
      this.canScrollPrev.set(currentScroll < maxScroll - tolerance);
    } else {
      this.canScrollPrev.set(el.scrollLeft > tolerance);
      this.canScrollNext.set(el.scrollLeft < maxScroll - tolerance);
    }
  }

  private scheduleScrollUpdate(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => this.updateScrollState(), 320);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    const isRtl = this.translationService?.direction() === 'rtl';
    const threshold = 40;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.scroll(isRtl ? 'prev' : 'next');
      } else {
        this.scroll(isRtl ? 'next' : 'prev');
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const isRtl = this.translationService?.direction() === 'rtl';
    if (event.key === 'ArrowRight') {
      this.scroll(isRtl ? 'prev' : 'next');
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.scroll(isRtl ? 'next' : 'prev');
      event.preventDefault();
    }
  }
      onCardClick(card: MealCard): void {
      if (card.id) {
        this.router.navigate(['/meals', card.id]);
      }

    }
}
