import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthButton } from '../../../../shared/ui/auth-button/auth-button';
import { AuthError } from '../../../../shared/ui/auth-error/auth-error';
import { AuthHeading } from '../../../../shared/ui/auth-heading/auth-heading';
import { AuthInput } from '../../../../shared/ui/auth-input/auth-input';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [ReactiveFormsModule, AuthHeading, AuthInput, AuthButton, AuthError, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly forgotPasswordService = inject(ForgotPasswordService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  constructor() {
    this.forgotPasswordService.clearRecoveryState();

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

    const email = this.form.getRawValue().email.trim();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.forgotPasswordService.forgotPassword(email).subscribe({
      next: () => {
        this.forgotPasswordService.setEmail(email);
        void this.router.navigateByUrl('/auth/verify-code');
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
