export interface Ingredient {
  name: string;
  amount: string;
}

export interface Nutrition {
  energy: string;
  protein: string;
  carbs: string;
  fat: string;
}

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner';

export interface Meal {
  id: string;
  category: MealCategory;
  title: string;
  description: string;
  image: string;
  nutrition: Nutrition;
  ingredients: Ingredient[];
}


export interface MealDbResponse {
  meals: Array<{
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags: string | null;
    strYoutube: string;
    [key: `strIngredient${number}`]: string | null | undefined;
    [key: `strMeasure${number}`]: string | null | undefined;
  }> | null;
}
