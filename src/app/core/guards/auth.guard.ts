import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AUTH_REDIRECT_PARAM } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';

/**
 * Restricts route access to authenticated users only.
 * Redirects unauthenticated visitors to `/auth/login` with optional returnUrl.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { [AUTH_REDIRECT_PARAM]: state.url },
  });
};
