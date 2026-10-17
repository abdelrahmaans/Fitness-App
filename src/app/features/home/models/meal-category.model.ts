export interface MealCategory {
  readonly idCategory: string;
  readonly strCategory: string;
  readonly strCategoryThumb: string;
  readonly strCategoryDescription?: string;
}

export interface MealCategoryResponse {
  readonly categories: MealCategory[];
}

export interface MealItem {
  readonly idMeal: string;
  readonly strMeal: string;
  readonly strMealThumb: string;
}

export interface MealItemsResponse {
  readonly meals: MealItem[] | null;
}
