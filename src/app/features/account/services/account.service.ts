import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { AuthUser } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import {
  ACTIVITY_LEVEL_OPTIONS,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
  type EditProfileRequest,
  type EditProfileResponse,
  type ProfileDataResponse,
} from '../models/account.models';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Local state signal for profile in case user changes are made */
  readonly userProfile = computed(() => this.authService.currentUser());

  /** Loading state during metric edits */
  readonly isUpdating = signal<boolean>(false);

  /**
   * Fetches latest user profile data from current auth state
   */
  getProfileData(): Observable<AuthUser | null> {
    return of(this.userProfile());
  }

  /**
   * Updates user profile metrics (Goal, Level, Weight, etc.) on backend
   * Endpoint: PUT /auth/editProfile
   */
  editProfile(payload: EditProfileRequest): Observable<EditProfileResponse> {
    this.isUpdating.set(true);
    return this.http
      .put<EditProfileResponse>(`${this.baseUrl}/auth/editProfile`, payload)
      .pipe(
        tap((res) => {
          this.isUpdating.set(false);
          if (res.user) {
            this.authService.updateUserProfile(res.user);
          }
        }),
        catchError((err) => {
          this.isUpdating.set(false);
          throw err;
        }),
      );
  }

  /**
   * Updates user password on backend
   * Endpoint: PATCH /auth/change-password
   */
  changePassword(payload: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    this.isUpdating.set(true);
    return this.http
      .patch<ChangePasswordResponse>(`${this.baseUrl}/auth/change-password`, payload)
      .pipe(
        tap((res) => {
          this.isUpdating.set(false);
          if (res.token) {
            this.authService.saveToken(res.token);
          }
        }),
        catchError((err) => {
          this.isUpdating.set(false);
          throw err;
        }),
      );
  }

  /**
   * Resolves display label for activity level (e.g. 'level2' -> 'Beginner')
   */
  getActivityLevelLabel(level?: string | null): string {
    if (!level) return 'Beginner';
    const match = ACTIVITY_LEVEL_OPTIONS.find(
      (opt) => opt.value.toLowerCase() === level.toLowerCase() || opt.displayLabel.toLowerCase() === level.toLowerCase(),
    );
    return match ? match.displayLabel : level;
  }

  /**
   * Resolves activity level key/value for radio selection
   */
  getActivityLevelValue(level?: string | null): string {
    if (!level) return 'level2';
    const match = ACTIVITY_LEVEL_OPTIONS.find(
      (opt) => opt.value.toLowerCase() === level.toLowerCase() || opt.displayLabel.toLowerCase() === level.toLowerCase(),
    );
    return match ? match.value : level;
  }
}
