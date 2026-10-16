/** Represents a difficulty level (e.g. "Beginner", "Advanced"). */
export interface Level {
  /** Note: the /levels endpoint uses `_id`, the by-prime-mover endpoint uses `id` */
  readonly id: string;
  readonly name: string;
}
