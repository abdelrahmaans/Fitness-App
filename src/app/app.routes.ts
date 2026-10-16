import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'about',
    loadChildren: () => import('./features/about/about.routes').then((m) => m.aboutRoutes),
  },
  {
    path: 'healthy',
    loadChildren: () =>
      import('./features/healthy-page/healthy-page.routes').then((m) => m.healthyRoutes),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./features/account/account.routes').then((m) => m.accountRoutes),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

