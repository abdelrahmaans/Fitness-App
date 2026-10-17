import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ExercisesApiResponse,
  LevelsApiResponse,
  LevelsByMuscleApiResponse,
  MuscleDetailsApiResponse,
  MusclesByGroupApiResponse,
  MusclesGroupApiResponse,
  RandomExercisesApiResponse,
  RandomMusclesApiResponse,
} from './models/classes-details-api.model';
import { Exercise } from './models/exercise.model';
import { Level } from './models/level.model';
import { Muscle, MuscleGroup } from './models/muscle.model';

@Injectable({
  providedIn: 'root',
})
export class ClassesDetailsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Fetches all muscle groups from the API */
  getMuscleGroups(): Observable<MuscleGroup[]> {
    return this.http.get<MusclesGroupApiResponse>(`${this.baseUrl}/muscles`).pipe(
      map((res) => res.musclesGroup ?? []),
      catchError(() => of([])),
    );
  }

  /** Fetches specific muscles by muscle group ID (legacy) */
  getMusclesByGroupId(groupId: string): Observable<Muscle[]> {
    return this.http
      .get<MuscleDetailsApiResponse>(`${this.baseUrl}/musclesGroup/${groupId}`)
      .pipe(
        map((res) => res.muscles ?? []),
        catchError(() => of([])),
      );
  }

  /**
   * 1- Fetches 20 Random Prime Mover Muscles
   * GET /muscles/random
   */
  getRandomPrimeMoverMuscles(): Observable<Muscle[]> {
    return this.http.get<RandomMusclesApiResponse>(`${this.baseUrl}/muscles/random`).pipe(
      map((res) => res.muscles ?? []),
      catchError(() => of([])),
    );
  }

  /**
   * 2- Fetches All Prime Mover Muscles by Muscle Group ID
   * GET /musclesGroup/by-muscle-group?muscleGroupId=:id
   */
  getPrimeMoverMusclesByGroupId(muscleGroupId: string): Observable<Muscle[]> {
    return this.http
      .get<MusclesByGroupApiResponse>(`${this.baseUrl}/musclesGroup/by-muscle-group`, {
        params: { muscleGroupId },
      })
      .pipe(
        map((res) => res.muscles ?? []),
        catchError(() => of([])),
      );
  }

  /**
   * 3- Fetches All Exercises
   * GET /exercises
   */
  getAllExercises(page?: number, limit?: number): Observable<ExercisesApiResponse> {
    const params: Record<string, string> = {};
    if (page !== undefined) {
      params['page'] = page.toString();
    }
    if (limit !== undefined) {
      params['limit'] = limit.toString();
    }

    return this.http
      .get<ExercisesApiResponse>(`${this.baseUrl}/exercises`, { params })
      .pipe(
        catchError(() =>
          of({
            message: 'error',
            totalExercises: 0,
            exercises: [],
          }),
        ),
      );
  }

  /**
   * 4- Fetches Exercises By Prime Mover Muscle and Difficulty Level
   * GET /exercises/by-muscle-difficulty?primeMoverMuscleId=:muscleId&difficultyLevelId=:levelId
   */
  getExercisesByMuscleAndDifficulty(
    primeMoverMuscleId: string,
    difficultyLevelId: string,
    page?: number,
  ): Observable<ExercisesApiResponse> {
    const params: Record<string, string> = {
      primeMoverMuscleId,
      difficultyLevelId,
    };
    if (page !== undefined) {
      params['page'] = page.toString();
    }

    return this.http
      .get<ExercisesApiResponse>(`${this.baseUrl}/exercises/by-muscle-difficulty`, { params })
      .pipe(
        catchError(() =>
          of({
            message: 'error',
            totalExercises: 0,
            exercises: [],
          }),
        ),
      );
  }

  /**
   * 5- Fetches Random Exercises for a Muscle Group and Difficulty Level
   * GET /exercises/random?targetMuscleGroupId=:groupId&difficultyLevelId=:levelId&limit=:limit
   */
  getRandomExercises(
    targetMuscleGroupId: string,
    difficultyLevelId: string,
    limit = 5,
  ): Observable<Exercise[]> {
    return this.http
      .get<RandomExercisesApiResponse>(`${this.baseUrl}/exercises/random`, {
        params: {
          targetMuscleGroupId,
          difficultyLevelId,
          limit: limit.toString(),
        },
      })
      .pipe(
        map((res) => res.exercises ?? []),
        catchError(() => of([])),
      );
  }

  /** Fetches all difficulty levels */
  getLevels(): Observable<Level[]> {
    return this.http.get<LevelsApiResponse>(`${this.baseUrl}/levels`).pipe(
      map((res) =>
        (res.levels ?? []).map((level) => ({
          id: level._id,
          name: level.name,
        })),
      ),
      catchError(() => of([])),
    );
  }

  /** Fetches difficulty levels filtered by prime mover muscle ID */
  getLevelsByMuscleId(primeMoverMuscleId: string): Observable<Level[]> {
    return this.http
      .get<LevelsByMuscleApiResponse>(
        `${this.baseUrl}/levels/difficulty-levels/by-prime-mover`,
        { params: { primeMoverMuscleId } },
      )
      .pipe(
        map((res) => res.difficulty_levels ?? []),
        catchError(() => of([])),
      );
  }
}
