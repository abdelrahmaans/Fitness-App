import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthButton } from '../../../../shared/ui/auth-button/auth-button';
import { AuthError } from '../../../../shared/ui/auth-error/auth-error';
import { AuthHeading } from '../../../../shared/ui/auth-heading/auth-heading';
import { AuthInput } from '../../../../shared/ui/auth-input/auth-input';
import { AuthLink } from '../../../../shared/ui/auth-link/auth-link';
import { AuthOrDivider } from '../../../../shared/ui/auth-or-divider/auth-or-divider';
import { AuthSocialMediaIcons } from '../../../../shared/ui/auth-social-media-icons/auth-social-media-icons';
import { LoginService } from '../../services/login/login.service';
import { strongPasswordValidator } from '../../validators/auth.validators';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthHeading,
    AuthInput,
    AuthLink,
    AuthButton,
    AuthOrDivider,
    AuthSocialMediaIcons,
    AuthError,
    TranslatePipe,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, strongPasswordValidator()],
    }),
  });

  protected readonly loginError = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.loginError()) {
        this.loginError.set(null);
      }
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginError.set(null);

    this.loginService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        const token = this.loginService.resolveToken(response);
        if (!token) {
          this.loginError.set('Login failed');
          return;
        }

        this.loginService.saveToken(token);
        void this.router.navigateByUrl('/home');
      },
      error: (error: { error?: unknown }) => {
        this.loginError.set(this.loginService.readLoginError(error.error));
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
