import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_KEY } from '../constants/auth.constants';
import { DEFAULT_LANGUAGE, TRANSLATION_ASSET_BASE_PATH } from '../constants/translation.constants';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';

/**
 * Functional HTTP Interceptor.
 *
 * Responsibilities:
 * 1. Attaches Accept-Language header dynamically based on active language signal.
 * 2. Attaches Authorization: Bearer <token> if token exists in localStorage/session.
 * 3. Bypasses static translation asset requests to prevent circular DI dependencies.
 * 4. Ensures immutable request cloning.
 * 5. Handles 401 Unauthorized responses by clearing session and redirecting to login.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Prevent circular dependency: bypass static translation files & static assets
  const isTranslationAsset =
    req.url.includes(TRANSLATION_ASSET_BASE_PATH) || req.url.endsWith('.json');
  if (isTranslationAsset) {
    return next(req);
  }

  // 2. Resolve dependencies safely
  const translationService = inject(TranslationService, { optional: true });
  const authService = inject(AuthService, { optional: true });
  const router = inject(Router, { optional: true });

  const currentLang = translationService?.currentLang() ?? DEFAULT_LANGUAGE;

  // 3. Resolve auth token from localStorage or AuthService
  let token: string | null = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem('token');
  }
  if (!token && authService) {
    token = authService.getToken();
  }

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl) || !req.url.startsWith('http');

  // 4. Build headers dictionary immutably
  const headersToSet: Record<string, string> = {
    'Accept-Language': currentLang,
  };

  if (token && isApiRequest) {
    headersToSet['Authorization'] = `Bearer ${token}`;
  }

  // 5. Clone request immutably
  const modifiedReq = req.clone({
    setHeaders: headersToSet,
  });

  // 6. Forward request and handle 401 globally
  return next(modifiedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isApiRequest) {
        authService?.clearSession();
        if (router) {
          void router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
