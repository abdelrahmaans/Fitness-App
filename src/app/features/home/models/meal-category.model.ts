export interface MealCategory {
  readonly idCategory: string;
  readonly strCategory: string;
  readonly strCategoryThumb: string;
}

export interface MealCategoryResponse {
  readonly categories: MealCategory[];
}
