/** Represents a single video item in the workout playlist. */
export interface PlaylistItem {
  /** Unique identifier for tracking */
  readonly id: string;

  /** Exercise name displayed as the item title */
  readonly title: string;

  /** Number of groups/sets (e.g. '3 Groups *15 Times') */
  readonly groups: string;

  /** First line of description text */
  readonly descriptionLine1: string;

  /** Second line of description text */
  readonly descriptionLine2: string;

  /** Path to the thumbnail image asset */
  readonly thumbnail: string;

  /** Alt text for the thumbnail image */
  readonly alt: string;
}

/** Difficulty level tab identifiers */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/** Represents a difficulty tab in the playlist filter */
export interface DifficultyTab {
  /** Unique identifier matching DifficultyLevel */
  readonly id: DifficultyLevel;

  /** i18n translation key for the tab label */
  readonly labelKey: string;
}
