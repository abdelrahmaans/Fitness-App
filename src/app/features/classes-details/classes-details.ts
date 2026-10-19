import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../layout/main/navbar/navbar';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SectionTitle } from '../../shared/ui/section-title/section-title';
import { MainVideo } from './components/main-video/main-video';
import { RecommendationForYou } from './components/recommendation-for-you/recommendation-for-you';
import { VideoPlaylist } from './components/video-playlist/video-playlist';
import { ClassesBadge } from './models/classes-badge.model';
import { PlaylistItem } from './models/playlist-item.model';
import { ClassesDetailsService } from './services/classes-details.service';
import { Exercise } from './services/models/exercise.model';
import { Muscle, MuscleGroup } from './services/models/muscle.model';

@Component({
  selector: 'app-classes-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Navbar,
    LanguageSwitcher,
    MainVideo,
    RecommendationForYou,
    VideoPlaylist,
    SectionTitle,
    TranslatePipe,
  ],
  templateUrl: './classes-details.html',
  styleUrl: './classes-details.scss',
})
export class ClassesDetails {
  private readonly classesDetailsService = inject(ClassesDetailsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  /** Muscle groups loaded from backend API (category filter tabs) */
  readonly muscleGroups = signal<MuscleGroup[]>([]);

  /** Currently selected muscle group ID */
  readonly activeCategory = signal<string>('');

  /** Prime mover muscles loaded for the active muscle group */
  readonly primeMoverMuscles = signal<Muscle[]>([]);

  /** Currently selected prime mover muscle ID */
  readonly activePrimeMoverMuscleId = signal<string>('');

  /** Currently active difficulty level ID */
  readonly activeLevelId = signal<string>('');

  /** Exercises loaded dynamically from the backend API */
  readonly exercises = signal<Exercise[]>([]);

  /** Currently selected exercise displayed in the main video card */
  readonly selectedExercise = signal<Exercise | null>(null);

  /** Loading state for muscles list */
  readonly isLoadingMuscles = signal<boolean>(false);

  /** Loading state for exercises list */
  readonly isLoadingExercises = signal<boolean>(false);

  /** Workout quality badges displayed under the main video */
  readonly badges = signal<readonly ClassesBadge[]>([
    {
      id: 'badge-1',
      textKey: 'CLASSES_DETAILS.EXPERTLY_DESIGNED',
      icon: '/images/right-arrow-white.png',
      alt: '',
    },
    {
      id: 'badge-2',
      textKey: 'CLASSES_DETAILS.EXPERTLY_DESIGNED',
      icon: '/images/right-arrow-white.png',
      alt: '',
    },
    {
      id: 'badge-3',
      textKey: 'CLASSES_DETAILS.EXPERTLY_DESIGNED',
      icon: '/images/right-arrow-white.png',
      alt: '',
    },
  ]);

  constructor() {
    this.classesDetailsService
      .getMuscleGroups()
      .pipe(takeUntilDestroyed())
      .subscribe((groups) => {
        this.muscleGroups.set(groups);
        if (groups.length > 0 && !this.activeCategory()) {
          const routeId = this.route.snapshot.paramMap.get('id');
          const matchedGroup = routeId ? groups.find((g) => g._id === routeId) : undefined;
          if (matchedGroup) {
            this.selectCategory(matchedGroup._id);
          } else {
            this.selectCategory(groups[0]._id, routeId ?? undefined);
          }
        }
      });

    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (id && this.muscleGroups().length > 0) {
        const matchedGroup = this.muscleGroups().find((g) => g._id === id);
        if (matchedGroup) {
          if (this.activeCategory() !== matchedGroup._id) {
            this.selectCategory(matchedGroup._id);
          }
        } else {
          this.activePrimeMoverMuscleId.set(id);
          this.loadExercises();
        }
      }
    });
  }

  /** Selects a category filter and loads its prime mover muscles */
  selectCategory(groupId: string, targetMuscleId?: string): void {
    this.activeCategory.set(groupId);
    this.isLoadingMuscles.set(true);

    this.classesDetailsService
      .getPrimeMoverMusclesByGroupId(groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (muscles) => {
          this.isLoadingMuscles.set(false);
          if (muscles.length > 0) {
            this.primeMoverMuscles.set(muscles);
            const foundTarget = targetMuscleId
              ? muscles.find((m) => m._id === targetMuscleId)
              : undefined;
            this.activePrimeMoverMuscleId.set(
              foundTarget ? foundTarget._id : targetMuscleId || muscles[0]._id,
            );
          } else {
            this.loadFallbackMuscles(targetMuscleId);
          }
          this.loadExercises();
        },
        error: () => {
          this.isLoadingMuscles.set(false);
          this.loadFallbackMuscles(targetMuscleId);
          this.loadExercises();
        },
      });
  }

  /** Loads random prime mover muscles when group-specific muscles return empty */
  private loadFallbackMuscles(targetMuscleId?: string): void {
    this.classesDetailsService
      .getRandomPrimeMoverMuscles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((muscles) => {
        this.primeMoverMuscles.set(muscles);
        if (muscles.length > 0) {
          const foundTarget = targetMuscleId
            ? muscles.find((m) => m._id === targetMuscleId)
            : undefined;
          this.activePrimeMoverMuscleId.set(
            foundTarget ? foundTarget._id : targetMuscleId || muscles[0]._id,
          );
        } else if (targetMuscleId) {
          this.activePrimeMoverMuscleId.set(targetMuscleId);
        }
      });
  }

  /** Selects a specific prime mover muscle and reloads its exercises */
  selectPrimeMoverMuscle(muscleId: string): void {
    this.activePrimeMoverMuscleId.set(muscleId);
    this.loadExercises();
  }

  /** Handles difficulty level change from playlist tabs */
  onLevelChange(levelId: string): void {
    this.activeLevelId.set(levelId);
    this.loadExercises();
  }

  /** Loads exercises for the current prime mover muscle and difficulty level */
  loadExercises(): void {
    const muscleId = this.activePrimeMoverMuscleId();
    const levelId = this.activeLevelId();
    const groupId = this.activeCategory();

    this.isLoadingExercises.set(true);

    if (muscleId && levelId) {
      this.classesDetailsService
        .getExercisesByMuscleAndDifficulty(muscleId, levelId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if (res.exercises && res.exercises.length > 0) {
              this.applyExercises(res.exercises);
            } else if (groupId) {
              this.loadRandomExercisesFallback(groupId, levelId);
            } else {
              this.loadAllExercisesFallback();
            }
          },
          error: () => {
            if (groupId) {
              this.loadRandomExercisesFallback(groupId, levelId);
            } else {
              this.loadAllExercisesFallback();
            }
          },
        });
    } else if (groupId && levelId) {
      this.loadRandomExercisesFallback(groupId, levelId);
    } else {
      this.loadAllExercisesFallback();
    }
  }

  /** Fallback: Loads random exercises for the category & difficulty */
  private loadRandomExercisesFallback(groupId: string, levelId: string): void {
    this.classesDetailsService
      .getRandomExercises(groupId, levelId, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exercises) => {
          if (exercises.length > 0) {
            this.applyExercises(exercises);
          } else {
            this.loadAllExercisesFallback();
          }
        },
        error: () => {
          this.loadAllExercisesFallback();
        },
      });
  }

  /** Fallback: Loads generic exercises list */
  private loadAllExercisesFallback(): void {
    this.classesDetailsService
      .getAllExercises(1, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.applyExercises(res.exercises ?? []);
        },
        error: () => {
          this.applyExercises([]);
        },
      });
  }

  /** Applies loaded exercises to signals and selects the first one */
  private applyExercises(exercises: Exercise[]): void {
    this.exercises.set(exercises);
    this.isLoadingExercises.set(false);
    if (exercises.length > 0) {
      this.selectedExercise.set(exercises[0]);
    } else {
      this.selectedExercise.set(null);
    }
  }

  /** Handles selection of an exercise item from the playlist */
  onSelectExercise(exercise: Exercise): void {
    this.selectedExercise.set(exercise);
  }

  /** Legacy / compatibility handler for playlist item click */
  onPlaylistItemSelect(item: PlaylistItem): void {
    const found = this.exercises().find((ex) => ex._id === item.id);
    if (found) {
      this.selectedExercise.set(found);
    }
  }
}
