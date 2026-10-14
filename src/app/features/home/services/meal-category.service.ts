import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MealCategory, MealCategoryResponse } from '../models/meal-category.model';

@Injectable({
  providedIn: 'root'
})
export class MealCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://www.themealdb.com/api/json/v1/1/categories.php';

  getCategories(): Observable<MealCategory[]> {
    return this.http.get<MealCategoryResponse>(this.apiUrl).pipe(
      map(response => response.categories || [])
    );
  }
}
