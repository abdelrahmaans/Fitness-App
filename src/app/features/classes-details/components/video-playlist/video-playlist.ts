import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { PlaylistItem } from '../../models/playlist-item.model';
import { ClassesDetailsService } from '../../services/classes-details.service';
import { Exercise } from '../../services/models/exercise.model';
import { Level } from '../../services/models/level.model';
import { Muscle } from '../../services/models/muscle.model';
import { getYouTubeThumbnail } from '../../utils/youtube.util';

@Component({
  selector: 'app-video-playlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-playlist.html',
  styleUrl: './video-playlist.scss',
})
export class VideoPlaylist {
  private readonly classesDetailsService = inject(ClassesDetailsService);

  /** Exercises received from parent (loaded via exercises API) */
  readonly exercises = input<Exercise[]>([]);

  /** Muscles received from parent (fallback if exercises not provided) */
  readonly muscles = input<Muscle[]>([]);

  /** ID of the currently selected exercise */
  readonly selectedExerciseId = input<string | undefined>(undefined);

  /** Optional prime mover muscle ID used to fetch specific difficulty levels */
  readonly primeMoverMuscleId = input<string | undefined>(undefined);

  /** Filter levels loaded dynamically from backend API */
  readonly levels = signal<Level[]>([]);

  /** ID of the currently active level */
  readonly activeLevelId = signal<string>('');

  /** Loading indicator for levels */
  readonly isLoadingLevels = signal<boolean>(false);

  /** Event emitted when a difficulty level is selected */
  readonly levelChange = output<string>();

  /** Event emitted when a playlist item is selected */
  readonly itemSelect = output<PlaylistItem>();

  /** Event emitted when an exercise item is selected */
  readonly exerciseSelect = output<Exercise>();

  /** Playlist items mapped from API exercises or muscles data */
  readonly playlistItems = computed<PlaylistItem[]>(() => {
    const exerciseList = this.exercises();
    if (exerciseList.length > 0) {
      return exerciseList.map((item) => {
        const videoUrl =
          item.short_youtube_demonstration_link || item.in_depth_youtube_explanation_link;
        return {
          id: item._id,
          title: item.exercise,
          groups: item.mechanics
            ? `${item.mechanics} • ${item.primary_equipment || 'Bodyweight'}`
            : '3 Groups • 15 Times',
          descriptionLine1: `${item.target_muscle_group} • ${item.prime_mover_muscle}`,
          descriptionLine2:
            item.movement_pattern_1 || item.posture || 'Controlled execution',
          thumbnail: getYouTubeThumbnail(videoUrl, '/images/workouts-1.webp'),
          alt: `${item.exercise} demonstration`,
        };
      });
    }

    const apiMuscles = this.muscles();
    if (apiMuscles.length > 0) {
      return apiMuscles.map((muscle) => ({
        id: muscle._id,
        title: muscle.name,
        groups: '3 Groups • 15 Times',
        descriptionLine1: 'Prime Mover Muscle',
        descriptionLine2: 'Focused activation',
        thumbnail: muscle.image || '/images/workouts-1.webp',
        alt: `${muscle.name} exercise demonstration`,
      }));
    }

    return this.defaultPlaylistItems;
  });

  /** Fallback playlist items when no API data available */
  private readonly defaultPlaylistItems: PlaylistItem[] = [
    {
      id: '1',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '2',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '3',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '4',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '5',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '6',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '7',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
    {
      id: '8',
      title: 'Bench Press',
      groups: '3 Groups *15 Times',
      descriptionLine1: 'Lorem Ipsum Dolor Sit',
      descriptionLine2: 'Amet Consectetur. Tempus',
      thumbnail: '/images/workouts-1.webp',
      alt: 'Bench Press exercise demonstration',
    },
  ];

  constructor() {
    toObservable(this.primeMoverMuscleId)
      .pipe(
        switchMap((muscleId) => {
          this.isLoadingLevels.set(true);
          const request$ = muscleId
            ? this.classesDetailsService.getLevelsByMuscleId(muscleId)
            : this.classesDetailsService.getLevels();

          return request$.pipe(finalize(() => this.isLoadingLevels.set(false)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((levels) => {
        this.levels.set(levels);
        if (levels.length > 0 && !levels.some((l) => l.id === this.activeLevelId())) {
          this.activeLevelId.set(levels[0].id);
        }
      });
  }

  /** Selects a difficulty level */
  selectLevel(levelId: string): void {
    this.activeLevelId.set(levelId);
    this.levelChange.emit(levelId);
  }

  /** Handles clicking a playlist item */
  onSelectItem(item: PlaylistItem): void {
    this.itemSelect.emit(item);
    const foundExercise = this.exercises().find((ex) => ex._id === item.id);
    if (foundExercise) {
      this.exerciseSelect.emit(foundExercise);
    }
  }
}
