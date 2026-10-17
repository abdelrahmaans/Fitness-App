import { Routes } from '@angular/router';

export const healthyRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layout/main/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./healthy-page').then((m) => m.HealthyPage),
      },
    ],
  },
];
