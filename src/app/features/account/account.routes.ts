import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/main/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/account/account').then((m) => m.Account),
      },
    ],
  },
];
