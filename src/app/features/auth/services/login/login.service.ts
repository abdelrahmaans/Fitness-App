import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import type { LoginRequest, LoginResponse } from '../../../../core/models/auth.models';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly authService = inject(AuthService);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.authService.login(credentials);
  }

  saveToken(token: string): void {
    this.authService.saveToken(token);
  }

  readLoginError(body: unknown): string {
    return this.authService.readError(body);
  }

  resolveToken(response: LoginResponse): string | null {
    return this.authService.resolveToken(response);
  }
}
