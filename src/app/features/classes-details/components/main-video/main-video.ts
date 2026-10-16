import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Exercise } from '../../services/models/exercise.model';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../utils/youtube.util';

@Component({
  selector: 'app-main-video',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './main-video.html',
  styleUrl: './main-video.scss',
})
export class MainVideo {
  private readonly sanitizer = inject(DomSanitizer);

  /** Active exercise displayed in the main video card */
  readonly exercise = input<Exercise | null>(null);

  /** Whether the video player is currently active (playing video) */
  readonly isPlaying = signal<boolean>(false);

  /** Computed exercise title */
  readonly title = computed(() => this.exercise()?.exercise || 'Featured Workout');

  /** Computed exercise description */
  readonly description = computed(() => {
    const ex = this.exercise();
    if (!ex) {
      return 'Explore expert-led exercise demonstrations with proper posture, mechanics, and target muscle activation for maximum workout effectiveness.';
    }
    const parts = [
      `Target: ${ex.target_muscle_group}`,
      `Prime Mover: ${ex.prime_mover_muscle}`,
      ex.posture ? `Posture: ${ex.posture}` : null,
      ex.mechanics ? `Mechanics: ${ex.mechanics}` : null,
      ex.movement_pattern_1 ? `Movement: ${ex.movement_pattern_1}` : null,
    ].filter(Boolean);

    return parts.join(' • ');
  });

  /** Computed thumbnail image */
  readonly thumbnail = computed(() => {
    const ex = this.exercise();
    const url = ex?.short_youtube_demonstration_link || ex?.in_depth_youtube_explanation_link;
    return getYouTubeThumbnail(url, '/images/video-bg.webp');
  });

  /** Computed level / difficulty badge */
  readonly difficultyBadge = computed(() => this.exercise()?.difficulty_level || 'Beginner');

  /** Computed equipment badge */
  readonly equipmentBadge = computed(() => this.exercise()?.primary_equipment || 'Bodyweight');

  /** Computed posture or mechanics badge */
  readonly postureBadge = computed(
    () => this.exercise()?.posture || this.exercise()?.mechanics || 'Compound',
  );

  /** Safe embed URL for YouTube player */
  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const ex = this.exercise();
    const rawUrl =
      ex?.short_youtube_demonstration_link || ex?.in_depth_youtube_explanation_link;
    const embed = getYouTubeEmbedUrl(rawUrl);
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  });

  /** Plays the video (embeds player or opens demonstration link) */
  onPlayVideo(): void {
    if (this.embedUrl()) {
      this.isPlaying.set(true);
    } else {
      const rawUrl =
        this.exercise()?.short_youtube_demonstration_link ||
        this.exercise()?.in_depth_youtube_explanation_link;
      if (rawUrl) {
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }

  /** Closes the embedded video player and returns to preview */
  onCloseVideo(): void {
    this.isPlaying.set(false);
  }
}
