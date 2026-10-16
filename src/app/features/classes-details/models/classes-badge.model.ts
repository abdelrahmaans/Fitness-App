/** Represents a feature badge displayed under the main video on the classes details page. */
export interface ClassesBadge {
  /** Unique identifier for @for track */
  readonly id: string;

  /** i18n translation key for badge text */
  readonly textKey: string;

  /** Path to the badge icon asset */
  readonly icon: string;

  /** Accessible alt text for decorative or informative icons */
  readonly alt: string;
}

/** Alias for semantic clarity across workout/classes domains */
export type WorkoutBadge = ClassesBadge;
