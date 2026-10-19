import { Routes } from '@angular/router';

export const classesDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layout/main/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/classes',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./classes-details').then((m) => m.ClassesDetails),
      },
    ],
  },
];
