import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthButton } from '../../../../shared/ui/auth-button/auth-button';
import { AuthError } from '../../../../shared/ui/auth-error/auth-error';
import { AuthHeading } from '../../../../shared/ui/auth-heading/auth-heading';
import { AuthLink } from '../../../../shared/ui/auth-link/auth-link';
import { AuthOtpInput } from '../../../../shared/ui/auth-otp-input/auth-otp-input';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-code',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [AuthHeading, AuthOtpInput, AuthButton, AuthLink, AuthError, TranslatePipe],
  templateUrl: './verify-code.html',
  styleUrl: './verify-code.scss',
})
export class VerifyCode {
  private readonly forgotPasswordService = inject(ForgotPasswordService);
  private readonly router = inject(Router);

  protected readonly otpCode = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly resendSuccessMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isResending = signal(false);

  constructor() {
    // If user arrived without initiating email recovery, redirect back to step 1
    if (!this.forgotPasswordService.recoveryEmail()) {
      void this.router.navigateByUrl('/auth/forgot-password');
    }
  }

  protected onOtpCompleted(code: string): void {
    this.otpCode.set(code);
    this.onConfirm();
  }

  protected onConfirm(): void {
    const code = this.otpCode().trim();
    if (!code) {
      this.errorMessage.set('Please enter verification code');
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.resendSuccessMessage.set(null);

    this.forgotPasswordService.verifyResetCode(code).subscribe({
      next: () => {
        this.forgotPasswordService.setResetCode(code);
        this.forgotPasswordService.setCodeVerified(true);
        void this.router.navigateByUrl('/auth/reset-password');
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

  protected onResend(): void {
    const email = this.forgotPasswordService.recoveryEmail();
    if (!email) {
      void this.router.navigateByUrl('/auth/forgot-password');
      return;
    }

    if (this.isResending()) {
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);
    this.resendSuccessMessage.set(null);

    this.forgotPasswordService.forgotPassword(email).subscribe({
      next: () => {
        this.resendSuccessMessage.set('A new verification code was sent to your email.');
      },
      error: (error: { error?: unknown }) => {
        this.errorMessage.set(this.forgotPasswordService.readError(error.error));
      },
      complete: () => {
        this.isResending.set(false);
      },
    });
  }
}
