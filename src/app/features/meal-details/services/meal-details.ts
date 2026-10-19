import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MealCategory, Meal, MealDbResponse, Ingredient } from '../models/meal-deatails.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MealDetailsService {
  private http = inject(HttpClient);
 private baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  readonly categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner'];

  // Signal State Management for Active Category & Selected Meal
  private activeCategorySignal = signal<MealCategory>('Dinner');
  private selectedMealSignal = signal<Meal | null>(null);

  readonly activeCategory = this.activeCategorySignal.asReadonly();
  readonly selectedMeal = this.selectedMealSignal.asReadonly();


  getMealsByCategory(category: MealCategory): Observable<Meal[]> {
    const apiCategoryName = category === 'Breakfast' ? 'Breakfast' : category === 'Lunch' ? 'Chicken' : 'Seafood';

    return this.http.get<any>(`${this.baseUrl}/filter.php?c=${apiCategoryName}`).pipe(
      map(response => {
        if (!response.meals) return [];
        return response.meals.map((item: any) => ({
          id: item.idMeal,
          category: category,
          title: item.strMeal,
          description: 'A delicious and healthy meal choice packed with nutrients tailored for your fitness routine.',
          image: item.strMealThumb,
          nutrition: {
            energy: '320 K',
            protein: '28 G',
            carbs: '12 G',
            fat: '18 G'
          },
          ingredients: []
        }));
      })
    );
  }

  /**
   * Fetch a single meal by ID using lookup endpoint:
   * GET www.themealdb.com/api/json/v1/1/lookup.php?i=52959
   */
  getMealById(id: string, category: MealCategory = 'Dinner'): Observable<Meal | null> {
    return this.http.get<MealDbResponse>(`${this.baseUrl}/lookup.php?i=${id}`).pipe(
      map(response => {
        if (!response.meals || response.meals.length === 0) return null;
        return this.mapApiMealToMeal(response.meals[0], category);
      })
    );
  }

  /**
   * Transforms raw API meal payload into application Meal model
   */
  private mapApiMealToMeal(apiMeal: any, category: MealCategory): Meal {
    const ingredients: Ingredient[] = [];

    // Extract ingredients strIngredient1-20 & strMeasure1-20
    for (let i = 1; i <= 20; i++) {
      const ingredientName = apiMeal[`strIngredient${i}`];
      const measure = apiMeal[`strMeasure${i}`];

      if (ingredientName && ingredientName.trim() !== '') {
        ingredients.push({
          name: ingredientName.trim(),
          amount: measure && measure.trim() !== '' ? measure.trim() : 'To serve'
        });
      }
    }

    return {
      id: apiMeal.idMeal,
      category: category,
      title: apiMeal.strMeal,
      description: apiMeal.strInstructions || 'No description available.',
      image: apiMeal.strMealThumb,
      // Default nutritional metrics matching UI Figma design
      nutrition: {
        energy: '320 K',
        protein: '28 G',
        carbs: '12 G',
        fat: '18 G'
      },
      ingredients: ingredients
    };
  }

  setCategory(category: MealCategory) {
    this.activeCategorySignal.set(category);
  }

  selectMeal(meal: Meal) {
    this.selectedMealSignal.set(meal);
  }
}
