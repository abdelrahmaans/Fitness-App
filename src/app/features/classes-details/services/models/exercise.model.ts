/** Represents an exercise item returned from the exercises API */
export interface Exercise {
  readonly _id: string;
  readonly exercise: string;
  readonly short_youtube_demonstration?: string | null;
  readonly in_depth_youtube_explanation?: string | null;
  readonly difficulty_level: string;
  readonly target_muscle_group: string;
  readonly prime_mover_muscle: string;
  readonly secondary_muscle?: string | null;
  readonly tertiary_muscle?: string | null;
  readonly primary_equipment?: string | null;
  readonly _primary_items?: number;
  readonly secondary_equipment?: string | null;
  readonly _secondary_items?: number;
  readonly posture?: string | null;
  readonly single_or_double_arm?: string | null;
  readonly continuous_or_alternating_arms?: string | null;
  readonly grip?: string | null;
  readonly load_position_ending?: string | null;
  readonly continuous_or_alternating_legs?: string | null;
  readonly foot_elevation?: string | null;
  readonly combination_exercises?: string | null;
  readonly movement_pattern_1?: string | null;
  readonly movement_pattern_2?: string | null;
  readonly movement_pattern_3?: string | null;
  readonly plane_of_motion_1?: string | null;
  readonly plane_of_motion_2?: string | null;
  readonly plane_of_motion_3?: string | null;
  readonly body_region?: string | null;
  readonly force_type?: string | null;
  readonly mechanics?: string | null;
  readonly laterality?: string | null;
  readonly primary_exercise_classification?: string | null;
  readonly short_youtube_demonstration_link?: string | null;
  readonly in_depth_youtube_explanation_link?: string | null;
}
