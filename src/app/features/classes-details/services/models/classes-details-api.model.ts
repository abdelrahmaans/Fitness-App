import { Exercise } from './exercise.model';
import { Level } from './level.model';
import { Muscle, MuscleGroup } from './muscle.model';

/** API response for GET /muscles */
export interface MusclesGroupApiResponse {
  readonly message: string;
  readonly musclesGroup: MuscleGroup[];
}

/** API response for GET /musclesGroup/:id */
export interface MuscleDetailsApiResponse {
  readonly message: string;
  readonly muscleGroup: MuscleGroup;
  readonly muscles: Muscle[];
}

/** API response for GET /muscles/random (20 Random Prime Mover Muscles) */
export interface RandomMusclesApiResponse {
  readonly message: string;
  readonly totalMuscles: number;
  readonly muscles: Muscle[];
}

/** API response for GET /musclesGroup/by-muscle-group?muscleGroupId=... */
export interface MusclesByGroupApiResponse {
  readonly message: string;
  readonly totalMuscles: number;
  readonly muscles: Muscle[];
}

/** Raw level item from GET /levels (uses `_id` instead of `id`) */
export interface RawLevelItem {
  readonly _id: string;
  readonly name: string;
}

/** API response for GET /levels */
export interface LevelsApiResponse {
  readonly message: string;
  readonly levels: RawLevelItem[];
}

/** API response for GET /levels/difficulty-levels/by-prime-mover */
export interface LevelsByMuscleApiResponse {
  readonly message: string;
  readonly totalLevels: number;
  readonly difficulty_levels: Level[];
}

/** API response for GET /exercises and GET /exercises/by-muscle-difficulty */
export interface ExercisesApiResponse {
  readonly message: string;
  readonly totalExercises: number;
  readonly totalPages?: number;
  readonly currentPage?: number;
  readonly exercises: Exercise[];
}

/** API response for GET /exercises/random */
export interface RandomExercisesApiResponse {
  readonly message: string;
  readonly totalExercises: number;
  readonly exercises: Exercise[];
}
