import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, type Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/auth.constants';
import type {
  ApiErrorBody,
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterFormRequest,
  RegisterFormResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // RxJS State Management
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  /** Observable stream of the currently logged-in user profile */
  readonly currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  /** Observable stream indicating whether the user is currently authenticated */
  readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  /** Angular Signal representing the current user for template consumption */
  readonly currentUser = toSignal(this.currentUser$, { initialValue: this.getStoredUser() });

  /**
   * Angular Signal representing the authentication status for template consumption.
   * Uses computed to always reflect the BehaviorSubject's current value synchronously,
   * avoiding stale reads from toSignal() during guard evaluation after login/signup.
   */
  private readonly isAuthenticatedSignal = toSignal(this.isAuthenticated$, { initialValue: this.hasValidToken() });
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal() || this.isAuthenticatedSubject.value);

  // -------------------------------------------------------------
  // HTTP Endpoints
  // -------------------------------------------------------------

  /**
   * Logs in user, saves token & profile, and broadcasts new authentication state.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/signin`, credentials).pipe(
      tap((response) => {
        const token = this.resolveToken(response);
        if (token) {
          const user = response.user ?? this.decodeUserFromToken(token);
          this.saveAuthSession(token, user);
        }
      }),
    );
  }

  /**
   * Registers a new user account, saves credentials, and updates auth state.
   */
  signup(body: RegisterFormRequest): Observable<RegisterFormResponse> {
    return this.http
      .post<RegisterFormResponse>(`${environment.apiBaseUrl}/auth/signup`, body)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.saveAuthSession(response.token, response.user);
          }
        }),
      );
  }

  /**
   * Initiates password recovery process by requesting an OTP code to email.
   */
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const payload: ForgotPasswordRequest = { email };
    return this.http.post<ForgotPasswordResponse>(
      `${environment.apiBaseUrl}/auth/forgotPassword`,
      payload,
    );
  }

  /**
   * Verifies the 6-digit OTP code received via email.
   */
  verifyResetCode(resetCode: string): Observable<VerifyResetCodeResponse> {
    const payload: VerifyResetCodeRequest = { resetCode };
    return this.http.post<VerifyResetCodeResponse>(
      `${environment.apiBaseUrl}/auth/verifyResetCode`,
      payload,
    );
  }

  /**
   * Resets user password to new password.
   */
  resetPassword(payload: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http
      .put<ResetPasswordResponse>(`${environment.apiBaseUrl}/auth/resetPassword`, payload)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.saveAuthSession(response.token);
          }
        }),
      );
  }

  /**
   * Logs out user, completely clears local/session storage, and resets reactive state.
   */
  logout(): void {
    this.clearSession();
    void this.router.navigate(['/auth/login']);
  }

  // -------------------------------------------------------------
  // Token & Storage Management
  // -------------------------------------------------------------

  /** Retrieves the active JWT token from storage */
  getToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  /** Retrieves the active user profile */
  getUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /** Saves token and optional user profile to storage and updates state */
  saveToken(token: string, user?: AuthUser | null): void {
    this.saveAuthSession(token, user);
  }

  /** Updates user profile data in state and storage */
  updateUserProfile(user: AuthUser): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  /** Completely clears token, user profile, and resets reactive state */
  clearSession(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /** Extracts readable error message from API response */
  readError(body: unknown): string {
    if (body && typeof body === 'object') {
      const apiError = body as ApiErrorBody;
      if (typeof apiError.error === 'string') {
        return apiError.error;
      }
      if (typeof apiError.message === 'string') {
        return apiError.message;
      }
    }
    return 'Something went wrong';
  }

  resolveToken(response: LoginResponse): string | null {
    return response.token ?? response.accessToken ?? null;
  }

  private saveAuthSession(token: string, user?: AuthUser | null): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      if (user) {
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
    }

    const resolvedUser = user ?? this.getStoredUser() ?? this.decodeUserFromToken(token);
    this.currentUserSubject.next(resolvedUser);
    this.isAuthenticatedSubject.next(true);
  }

  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  private getStoredUser(): AuthUser | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private decodeUserFromToken(token: string): AuthUser | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const decoded = JSON.parse(json) as Record<string, unknown>;
      return {
        _id: (decoded['_id'] as string) ?? (decoded['id'] as string) ?? undefined,
        email: decoded['email'] as string | undefined,
        role: decoded['role'] as string | undefined,
      };
    } catch {
      return null;
    }
  }
}
