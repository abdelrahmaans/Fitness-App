import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ReusableCard } from '../../../../shared/ui/reusable-card/reusable-card';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import {
  MuscleGroup,
  WorkoutCardItem,
  WorkoutsService,
} from '../../services/workouts.service';

@Component({
  selector: 'app-workouts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SectionTitle, ReusableCard],
  templateUrl: './workouts.html',
  styleUrl: './workouts.scss',
})
export class Workouts implements OnInit {
  private readonly workoutsService = inject(WorkoutsService);
  private readonly translationService = inject(TranslationService, { optional: true });

  /** Muscle groups loaded from backend API */
  readonly muscleGroups = signal<MuscleGroup[]>([]);

  /** Currently selected filter category ID ('all' for Full Body) */
  readonly activeCategory = signal<string>('all');

  /** All workout / muscle items for currently active category (loaded dynamically from backend) */
  readonly items = signal<WorkoutCardItem[]>([]);

  /** Loading state during API category switches */
  readonly isLoading = signal<boolean>(true);

  /** Active carousel slide / item index (0-indexed) */
  readonly currentSlide = signal<number>(0);

  /** Responsive items per view based on screen size */
  readonly itemsPerPage = signal<number>(3);

  /** Touch swipe starting clientX */
  private touchStartX = 0;

  /** RTL direction check for correct translation transform */
  readonly isRtl = computed(() => {
    return this.translationService?.direction() === 'rtl';
  });

  /** Slide width percentage based on itemsPerPage */
  readonly slideWidth = computed(() => {
    const perPage = this.itemsPerPage();
    return `${100 / perPage}%`;
  });

  /** Max slide offset index */
  readonly maxSlideIndex = computed(() => {
    const total = this.items().length;
    const perPage = this.itemsPerPage();
    return Math.max(0, total - perPage);
  });

  /** Total number of carousel page views */
  readonly totalPages = computed(() => {
    const total = this.items().length;
    const perPage = this.itemsPerPage();
    return Math.max(1, Math.ceil(total / perPage));
  });

  /** Computed array of pages for pagination dot indicators */
  readonly pages = computed(() => {
    const total = this.items().length;
    const perPage = this.itemsPerPage();
    if (total <= perPage) {
      return Array.from({ length: Math.min(3, Math.max(1, total)) }, (_, i) => i);
    }
    const count = Math.ceil(total / perPage);
    return Array.from({ length: Math.max(count, 3) }, (_, i) => i);
  });

  /** Computed CSS transform string for the carousel track */
  readonly trackTransform = computed(() => {
    const slide = this.currentSlide();
    const perPage = this.itemsPerPage();
    const percentage = (slide * 100) / perPage;
    const isRtl = this.isRtl();
    return isRtl ? `translateX(${percentage}%)` : `translateX(-${percentage}%)`;
  });

  ngOnInit(): void {
    this.updateItemsPerPage();
    this.loadMuscleGroups();
    this.selectCategory('all');
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerPage();
  }

  private updateItemsPerPage(): void {
    if (typeof window === 'undefined') return;
    const width = window.innerWidth;
    if (width < 640) {
      this.itemsPerPage.set(1);
    } else if (width < 1024) {
      this.itemsPerPage.set(2);
    } else {
      this.itemsPerPage.set(3);
    }
    // Clamp slide if resized
    if (this.currentSlide() > this.maxSlideIndex()) {
      this.currentSlide.set(this.maxSlideIndex());
    }
  }

  /** Loads muscle groups from API */
  loadMuscleGroups(): void {
    this.workoutsService.getMuscleGroups().subscribe((groups) => {
      this.muscleGroups.set(groups);
    });
  }

  /** Filters programs by selected muscle group directly from backend API */
  selectCategory(groupId: string): void {
    this.activeCategory.set(groupId);
    this.currentSlide.set(0);
    this.isLoading.set(true);

    const request$ =
      groupId === 'all'
        ? this.workoutsService.getRandomMuscles()
        : this.workoutsService.getMusclesByGroupId(groupId);

    request$.subscribe({
      next: (muscles) => {
        const itemsWithImages = (muscles ?? []).filter((m) => !!m.image);
        const sourceList = itemsWithImages.length > 0 ? itemsWithImages : (muscles ?? []);
        const mapped: WorkoutCardItem[] = sourceList.map((m) => ({
          id: m._id,
          title: m.name,
          image: m.image || '/images/workouts-1.webp',
          alt: m.name,
        }));
        this.items.set(mapped);
        this.isLoading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /** Navigates carousel to specific slide index */
  goToSlide(index: number): void {
    const max = this.maxSlideIndex();
    if (max === 0) {
      this.currentSlide.set(0);
      return;
    }
    const target = Math.min(index, max);
    this.currentSlide.set(target);
  }

  /** Navigates to previous carousel slide */
  prevSlide(): void {
    const max = this.maxSlideIndex();
    if (max === 0) return;
    this.currentSlide.update((curr) => (curr > 0 ? curr - 1 : max));
  }

  /** Navigates to next carousel slide */
  nextSlide(): void {
    const max = this.maxSlideIndex();
    if (max === 0) return;
    this.currentSlide.update((curr) => (curr < max ? curr + 1 : 0));
  }

  /** Touch swipe navigation */
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const threshold = 40;
    const isRtl = this.isRtl();

    if (deltaX < -threshold) {
      if (isRtl) this.prevSlide(); else this.nextSlide();
    } else if (deltaX > threshold) {
      if (isRtl) this.nextSlide(); else this.prevSlide();
    }
  }

  /** Card click handler */
  onCardClick(item: WorkoutCardItem): void {
    // Interactive action hook
  }
}
