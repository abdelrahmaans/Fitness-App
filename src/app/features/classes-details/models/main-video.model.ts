/** Represents the main featured video displayed at the top of classes details. */
export interface MainVideoData {
  /** Unique identifier */
  readonly id: string;

  /** Exercise/class title (e.g. 'Chest Exercise') */
  readonly title: string;

  /** Descriptive paragraph about the exercise */
  readonly description: string;

  /** Duration label (e.g. '30 MIN') */
  readonly duration: string;

  /** Calorie burn label (e.g. '130 Cal') */
  readonly calories: string;

  /** Path to the thumbnail/cover image */
  readonly thumbnail: string;

  /** Alt text for the thumbnail image */
  readonly alt: string;
}
