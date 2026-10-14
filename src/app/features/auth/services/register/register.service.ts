import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type { ApiErrorBody } from '../../models/shared/api-error.model';
import type {
  RegisterFormResponse,
  SignupDraft,
} from '../../models/register/register.models';
import type { AuthUser } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';

const DRAFT_STORAGE_KEY = 'signup_wizard_draft';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly draftData = signal<SignupDraft>({});

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        try {
          this.draftData.set(JSON.parse(stored));
        } catch {}
      }
    }
  }

  updateDraft(data: Partial<SignupDraft>): void {
    this.draftData.update((prev) => {
      const newDraft = { ...prev, ...data };
      if (typeof localStorage !== 'undefined') {
        const { password, rePassword, ...safeDraft } = newDraft;
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(safeDraft));
      }
      return newDraft;
    });
  }

  clearDraft(): void {
    this.draftData.set({});
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }

  signup(body: SignupDraft): Observable<RegisterFormResponse> {
    return this.http.post<RegisterFormResponse>(`${environment.apiBaseUrl}/auth/signup`, body);
  }

  saveToken(token: string, user?: AuthUser | null): void {
    this.authService.saveToken(token, user);
  }

  readRegisterError(body: unknown): string {
    if (body && typeof body === 'object' && 'error' in body) {
      const message = (body as ApiErrorBody).error;
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'Something went wrong';
  }
}
