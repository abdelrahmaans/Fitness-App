import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface MuscleGroup {
  _id: string;
  name: string;
}

export interface Muscle {
  _id: string;
  name: string;
  image: string;
}

export interface MusclesGroupApiResponse {
  message: string;
  musclesGroup: MuscleGroup[];
}

export interface MuscleDetailsApiResponse {
  message: string;
  muscleGroup: MuscleGroup;
  muscles: Muscle[];
}

export interface RandomMusclesApiResponse {
  message: string;
  totalMuscles: number;
  muscles: Muscle[];
}

export interface WorkoutCardItem {
  id: string;
  title: string;
  image: string;
  alt?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Default featured training programs matching the mockups */
  readonly defaultFeaturedWorkouts: readonly WorkoutCardItem[] = [
    {
      id: 'group-workout',
      title: 'WORKOUTS.GROUP_WORKOUT',
      image: '/images/workouts-1.webp',
      alt: 'Group workout training in gym',
      category: 'Full Body',
    },
    {
      id: 'personal-training',
      title: 'WORKOUTS.PERSONAL_TRAINING',
      image: '/images/workouts-2.webp',
      alt: 'Personal fitness trainer coaching athlete',
      category: 'Full Body',
    },
    {
      id: 'muscle-building',
      title: 'WORKOUTS.MUSCLE_BUILDING',
      image: '/images/workouts-3.webp',
      alt: 'Athlete training on muscle building equipment',
      category: 'Full Body',
    },
  ];

  /** Fetches all muscle groups from the API */
  getMuscleGroups(): Observable<MuscleGroup[]> {
    return this.http.get<MusclesGroupApiResponse>(`${this.baseUrl}/muscles`).pipe(
      map((res) => res.musclesGroup ?? []),
      catchError((error) => {
        console.error('Failed to load muscle groups from API:', error);
        return of([]);
      }),
    );
  }

  /** Fetches specific muscles by muscle group id */
  getMusclesByGroupId(groupId: string): Observable<Muscle[]> {
    return this.http
      .get<MuscleDetailsApiResponse>(`${this.baseUrl}/musclesGroup/${groupId}`)
      .pipe(
        map((res) => res.muscles ?? []),
        catchError((error) => {
          console.error(`Failed to load muscles for group ${groupId}:`, error);
          return of([]);
        }),
      );
  }

  /** Fetches 20 random muscles (used for Full Body) from backend API */
  getRandomMuscles(): Observable<Muscle[]> {
    return this.http
      .get<RandomMusclesApiResponse>(`${this.baseUrl}/muscles/random`)
      .pipe(
        map((res) => res.muscles ?? []),
        catchError((error) => {
          console.error('Failed to load random muscles from API:', error);
          return of([]);
        }),
      );
  }
}
