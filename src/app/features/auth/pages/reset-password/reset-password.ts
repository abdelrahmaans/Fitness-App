import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthButton } from '../../../../shared/ui/auth-button/auth-button';
import { AuthError } from '../../../../shared/ui/auth-error/auth-error';
import { AuthHeading } from '../../../../shared/ui/auth-heading/auth-heading';
import { AuthInput } from '../../../../shared/ui/auth-input/auth-input';
import { authPasswordsMatchValidator } from '../../../../shared/utils/auth-password-match';
import { strongPasswordValidator } from '../../validators/auth.validators';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [ReactiveFormsModule, AuthHeading, AuthInput, AuthButton, AuthError, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly forgotPasswordService = inject(ForgotPasswordService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, strongPasswordValidator()],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: authPasswordsMatchValidator('password', 'confirmPassword') },
  );

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  constructor() {
    // If user arrived without email, redirect back to step 1
    if (!this.forgotPasswordService.recoveryEmail()) {
      void this.router.navigateByUrl('/auth/forgot-password');
    }

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set(null);
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

    const email = this.forgotPasswordService.recoveryEmail();
    if (!email) {
      void this.router.navigateByUrl('/auth/forgot-password');
      return;
    }

    const { password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.forgotPasswordService
      .resetPassword({
        email,
        newPassword: password,
      })
      .subscribe({
        next: () => {
          this.forgotPasswordService.clearRecoveryState();
          void this.router.navigateByUrl('/auth/login');
        },
        error: (error: { error?: unknown }) => {
          this.errorMessage.set(this.forgotPasswordService.readError(error.error));
          this.isSubmitting.set(false);
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
  }
}
