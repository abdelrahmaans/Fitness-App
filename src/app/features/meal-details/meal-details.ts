import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Meal, MealCategory } from './models/meal-deatails.model';
import { ActivatedRoute } from '@angular/router';
import { MealDetailsService } from './services/meal-details';
import { Navbar } from '../../layout/main/navbar/navbar';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-meal-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, LanguageSwitcher,TranslatePipe],
  templateUrl: './meal-details.html',
  styleUrl: './meal-details.scss',
})
export class MealDetails {
  private route = inject(ActivatedRoute);
  private mealService = inject(MealDetailsService);

  categories: MealCategory[] = this.mealService.categories;
  readonly activeCategory = signal<MealCategory>(this.mealService.activeCategory());
  selectedMeal = this.mealService.selectedMeal;

  categoryMeals: Meal[] = [];
  isLoading = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const mealId = params.get('id');
      if (mealId) {
        this.fetchMealDetails(mealId);
      }

      // تحميل الوجبات الخاصة بالتصنيف الحالي عند فتح الصفحة لضمان عمل الـ Sidebar والـ Tabs
      this.onCategoryChange(this.activeCategory());
    });
  }

  fetchMealDetails(id: string) {
    this.isLoading = true;
    this.mealService.getMealById(id, this.activeCategory()).subscribe({
      next: (meal: Meal | null) => {
        if (meal) {
          this.mealService.selectMeal(meal);
        }
        this.isLoading = false;
      },

    });
  }

  onCategoryChange(category: MealCategory) {
    this.activeCategory.set(category);
    this.mealService.setCategory(category);
    this.isLoading = true;

    this.mealService.getMealsByCategory(category).subscribe({
      next: (meals) => {
        this.categoryMeals = meals;
        if (meals.length > 0 && !this.selectedMeal()) {
          this.fetchMealDetails(meals[0].id);
        }
        this.isLoading = false;
      }
    });
  }

  onSelectMeal(meal: Meal) {
    this.mealService.selectMeal(meal);
  }
}
