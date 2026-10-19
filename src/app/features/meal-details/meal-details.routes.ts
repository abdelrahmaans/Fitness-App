import { Routes } from '@angular/router';

export const mealDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layout/main/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./meal-details').then((m) => m.MealDetails),
      },
    ],
  },
];
