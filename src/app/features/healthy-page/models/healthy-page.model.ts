import { MealCard } from '../../home/models/meal-card.model';

/** Represents a meal time filter tab (e.g. Breakfast, Lunch, Dinner). */
export interface MealFilterTab {
  readonly id: string;
  readonly labelKey: string;
  readonly apiCategory: string;
}

/** Number of meal cards displayed per page on the Healthy Page (6 cards in a 3x2 grid). */
export const HEALTHY_PAGE_MEALS_PER_PAGE = 6;

/** Available filter tabs matching the design mockup */
export const MEAL_FILTER_TABS: readonly MealFilterTab[] = [
  {
    id: 'breakfast',
    labelKey: 'SECTION_TITLE.HEALTHY.FILTER_BREAKFAST',
    apiCategory: 'Breakfast',
  },
  {
    id: 'lunch',
    labelKey: 'SECTION_TITLE.HEALTHY.FILTER_LUNCH',
    apiCategory: 'Chicken',
  },
  {
    id: 'dinner',
    labelKey: 'SECTION_TITLE.HEALTHY.FILTER_DINNER',
    apiCategory: 'Pasta',
  },
] as const;

export type { MealCard };
