/** Represents a muscle group category (e.g. "Abdominals", "Chest"). */
export interface MuscleGroup {
  readonly _id: string;
  readonly name: string;
}

/** Represents a specific muscle within a muscle group. */
export interface Muscle {
  readonly _id: string;
  readonly name: string;
  readonly image: string;
}
