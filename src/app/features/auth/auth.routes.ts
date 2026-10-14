import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/auth/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register-form/register-form').then((m) => m.RegisterForm),
      },
      {
        path: 'register/age',
        loadComponent: () => import('./pages/register/age/age').then((m) => m.RegisterAge),
      },
      {
        path: 'register/height',
        loadComponent: () => import('./pages/register/height/height').then((m) => m.Height),
      },
      {
        path: 'register/gender',
        loadComponent: () =>
          import('./pages/register/gender/gender-selection/gender-selection').then(
            (m) => m.GenderSelection,
          ),
      },
      {
        path: 'register/weight',
        loadComponent: () => import('./pages/register/weight/weight').then((m) => m.Weight),
      },
      {
        path: 'register/goal',
        loadComponent: () =>
          import('./pages/register/onboarding-goal/onboarding-goal').then((m) => m.OnboardingGoal),
      },
      {
        path: 'register/activity-level',
        loadComponent: () =>
          import('./pages/register/onboarding-activity-level/onboarding-activity-level').then(
            (m) => m.OnboardingActivityLevel,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'verify-code',
        loadComponent: () =>
          import('./pages/verify-code/verify-code').then((m) => m.VerifyCode),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
];
