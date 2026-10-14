/** Represents a single meal card displayed in the Healthy Nutrition section. */
export interface MealCard {
  /** Unique identifier for tracking */
  readonly id: string;

  /** i18n translation key for the card title (e.g. 'MEAL_CARD.BREAKFAST'). */
  readonly titleKey: string;

  /** Path to the card image asset. */
  readonly image: string;

  /** Accessible alt text for the image. */
  readonly alt: string;
}
