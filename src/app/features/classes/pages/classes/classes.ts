import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation.service';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import {
  MuscleGroup,
  WorkoutCardItem,
  WorkoutsService,
} from '../../../home/services/workouts.service';

@Component({
  selector: 'app-classes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SectionTitle, ReusableCard, LanguageSwitcher],
  templateUrl: './classes.html',
  styleUrl: './classes.scss',
})
export class Classes {
  private readonly workoutsService = inject(WorkoutsService);
  private readonly translationService = inject(TranslationService, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private requestId = 0;

  readonly muscleGroups = signal<MuscleGroup[]>([]);
  readonly activeCategory = signal<string>('all');
  readonly items = signal<WorkoutCardItem[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly currentSlide = signal<number>(0);
  readonly columns = signal<number>(3);
  readonly rows = signal<number>(2);

  private touchStartX = 0;

  readonly isRtl = computed(() => this.translationService?.direction() === 'rtl');

  readonly pageSize = computed(() => Math.max(1, this.columns() * this.rows()));

  readonly cardPages = computed(() => {
    const list = this.items();
    const size = this.pageSize();
    const pages: WorkoutCardItem[][] = [];
    for (let index = 0; index < list.length; index += size) {
      pages.push(list.slice(index, index + size));
    }
    return pages;
  });

  readonly maxSlideIndex = computed(() => Math.max(0, this.cardPages().length - 1));

  readonly trackTransform = computed(() => {
    const slide = this.currentSlide();
    return this.isRtl() ? `translateX(${slide * 100}%)` : `translateX(-${slide * 100}%)`;
  });

  constructor() {
    afterNextRender(() => this.updateLayout());

    effect(() => {
      const lang = this.translationService?.currentLang() ?? 'en';
      untracked(() => this.reloadLocalizedContent(lang));
    });
  }

  /** Reloads tabs and cards so names follow the Accept-Language header. */
  private reloadLocalizedContent(_lang: string): void {
    this.loadMuscleGroups();
    this.selectCategory(this.activeCategory());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateLayout();
  }

  private updateLayout(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const width = window.innerWidth;
    if (width < 640) {
      this.columns.set(1);
      this.rows.set(1);
    } else if (width < 1024) {
      this.columns.set(2);
      this.rows.set(2);
    } else {
      this.columns.set(3);
      this.rows.set(2);
    }
    if (this.currentSlide() > this.maxSlideIndex()) {
      this.currentSlide.set(this.maxSlideIndex());
    }
  }

  loadMuscleGroups(): void {
    this.workoutsService
      .getMuscleGroups()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groups) => this.muscleGroups.set(groups));
  }

  selectCategory(groupId: string): void {
    const requestId = ++this.requestId;
    this.activeCategory.set(groupId);
    this.currentSlide.set(0);
    this.isLoading.set(true);

    const request$ =
      groupId === 'all'
        ? this.workoutsService.getRandomMuscles()
        : this.workoutsService.getMusclesByGroupId(groupId);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (muscles) => {
        if (requestId !== this.requestId) {
          return;
        }
        const withImages = (muscles ?? []).filter((muscle) => !!muscle.image);
        const source = withImages.length > 0 ? withImages : (muscles ?? []);
        this.items.set(
          source.map((muscle) => ({
            id: muscle._id,
            title: muscle.name,
            image: muscle.image || '/images/workouts-1.webp',
            alt: muscle.name,
          })),
        );
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.requestId) {
          return;
        }
        this.items.set([]);
        this.isLoading.set(false);
      },
    });
  }

  goToSlide(index: number): void {
    const max = this.maxSlideIndex();
    this.currentSlide.set(Math.min(Math.max(index, 0), max));
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const threshold = 40;
    if (Math.abs(deltaX) < threshold) {
      return;
    }
    const swipeNext = this.isRtl() ? deltaX > 0 : deltaX < 0;
    const max = this.maxSlideIndex();
    if (max === 0) {
      return;
    }
    this.currentSlide.update((current) => {
      if (swipeNext) {
        return current < max ? current + 1 : 0;
      }
      return current > 0 ? current - 1 : max;
    });
  }

  /** Card click handler: navigates to classes details page based on the API ID */
  onCardClick(item: WorkoutCardItem): void {
    if (item.id) {
      this.router.navigate(['/classes', item.id]);
    }
  }
}
