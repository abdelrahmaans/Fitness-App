import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  MealCategory,
  MealCategoryResponse,
  MealItem,
  MealItemsResponse,
} from '../models/meal-category.model';

@Injectable({
  providedIn: 'root',
})
export class MealCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';
  private readonly filterApiUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php';

  /** Fetches all meal categories from TheMealDB API */
  getCategories(): Observable<MealCategory[]> {
    return this.http.get<MealCategoryResponse>(this.apiUrl).pipe(
      map((response) => response.categories || []),
      catchError(() => of([])),
    );
  }

  /** Fetches meals belonging to a specific category from TheMealDB API */
  getMealsByCategory(category: string): Observable<MealItem[]> {
    return this.http
      .get<MealItemsResponse>(`${this.filterApiUrl}?c=${encodeURIComponent(category)}`)
      .pipe(
        map((response) => response.meals || []),
        catchError(() => of([])),
      );
  }
}
