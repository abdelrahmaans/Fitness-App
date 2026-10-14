import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
} from '../../models/forgot-password/forgot-password.models';

const RECOVERY_STORAGE_KEY = 'super_fitness_pwd_recovery_email';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private readonly http = inject(HttpClient);

  readonly recoveryEmail = signal<string | null>(this.getStoredEmail());
  readonly resetCode = signal<string | null>(null);
  readonly isCodeVerified = signal(false);

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const payload: ForgotPasswordRequest = { email };
    return this.http.post<ForgotPasswordResponse>(
      `${environment.apiBaseUrl}/auth/forgotPassword`,
      payload,
    );
  }

  verifyResetCode(resetCode: string): Observable<VerifyResetCodeResponse> {
    const payload: VerifyResetCodeRequest = { resetCode };
    return this.http.post<VerifyResetCodeResponse>(
      `${environment.apiBaseUrl}/auth/verifyResetCode`,
      payload,
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.put<ResetPasswordResponse>(
      `${environment.apiBaseUrl}/auth/resetPassword`,
      payload,
    );
  }

  setEmail(email: string): void {
    this.recoveryEmail.set(email);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(RECOVERY_STORAGE_KEY, email);
    }
  }

  setResetCode(code: string): void {
    this.resetCode.set(code);
  }

  setCodeVerified(verified: boolean): void {
    this.isCodeVerified.set(verified);
  }

  clearRecoveryState(): void {
    this.recoveryEmail.set(null);
    this.resetCode.set(null);
    this.isCodeVerified.set(false);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
    }
  }

  readError(body: unknown): string {
    if (body && typeof body === 'object') {
      if ('error' in body && typeof (body as { error?: unknown }).error === 'string') {
        return (body as { error: string }).error;
      }
      if ('message' in body && typeof (body as { message?: unknown }).message === 'string') {
        return (body as { message: string }).message;
      }
    }
    return 'Something went wrong';
  }

  private getStoredEmail(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(RECOVERY_STORAGE_KEY);
  }
}
