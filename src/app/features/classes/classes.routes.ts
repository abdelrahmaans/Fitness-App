import { Routes } from '@angular/router';

export const classesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/main/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/classes/classes').then((m) => m.Classes),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../classes-details/classes-details').then((m) => m.ClassesDetails),
      },
    ],
  },
];
