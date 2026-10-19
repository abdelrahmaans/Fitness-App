import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideGlobe,
  LucideLifeBuoy,
  LucideLoader2,
  LucideLogOut,
  LucideMoon,
  LucideRotateCw,
  LucideShieldAlert,
  LucideShieldCheck,
  LucideSun,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { SettingsModalType } from '../../models/account.models';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    LucideRotateCw,
    LucideGlobe,
    LucideMoon,
    LucideSun,
    LucideShieldCheck,
    LucideShieldAlert,
    LucideLifeBuoy,
    LucideLogOut,
    LucideX,
    LucideEye,
    LucideEyeOff,
    LucideLoader2,
    LucideCheck,
  ],
  templateUrl: './settings-menu.html',
  styleUrl: './settings-menu.scss',
})
export class SettingsMenu {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Theme and language reactive signals */
  readonly isDark = this.themeService.isDark;
  readonly currentLang = this.translationService.currentLang;
  readonly isUpdating = this.accountService.isUpdating;

  /** Active modal state */
  readonly activeModal = signal<SettingsModalType>(null);

  /** Change Password form state */
  readonly isSubmittingPassword = signal<boolean>(false);
  readonly passwordSuccess = signal<boolean>(false);
  readonly passwordError = signal<string | null>(null);

  /** Visibility toggles for password inputs */
  readonly showCurrentPassword = signal<boolean>(false);
  readonly showNewPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  /** Reactive Change Password Form */
  readonly changePasswordForm = this.fb.group({
    password: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  /**
   * Opens a specific settings modal
   */
  openModal(type: SettingsModalType): void {
    this.activeModal.set(type);
    if (type === 'change-password') {
      this.resetPasswordForm();
    }
  }

  /**
   * Closes active modal
   */
  closeModal(): void {
    this.activeModal.set(null);
    this.resetPasswordForm();
  }

  /**
   * Toggles application theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Toggles or switches application language
   */
  toggleLanguage(): void {
    this.translationService.toggleLanguage().subscribe();
  }

  /**
   * Sets a specific language ('en' | 'ar')
   */
  selectLanguage(lang: 'en' | 'ar'): void {
    if (this.currentLang() !== lang) {
      this.translationService.setLanguage(lang).subscribe();
    }
  }

  /**
   * Toggles current password visibility
   */
  toggleShowCurrentPassword(): void {
    this.showCurrentPassword.update((prev) => !prev);
  }

  /**
   * Toggles new password visibility
   */
  toggleShowNewPassword(): void {
    this.showNewPassword.update((prev) => !prev);
  }

  /**
   * Toggles confirm password visibility
   */
  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((prev) => !prev);
  }

  /**
   * Submits Change Password request to backend
   */
  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { password, newPassword, confirmPassword } = this.changePasswordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordError.set('ACCOUNT.SETTINGS.CHANGE_PASSWORD.MISMATCH_ERROR');
      return;
    }

    this.isSubmittingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    this.accountService
      .changePassword({ password, newPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmittingPassword.set(false);
          this.passwordSuccess.set(true);
          setTimeout(() => {
            if (this.activeModal() === 'change-password') {
              this.closeModal();
            }
          }, 1500);
        },
        error: (err: unknown) => {
          this.isSubmittingPassword.set(false);
          const errorMsg =
            (err as { error?: { error?: string; message?: string } })?.error?.error ||
            (err as { error?: { message?: string } })?.error?.message ||
            'Failed to change password. Please verify current password.';
          this.passwordError.set(errorMsg);
        },
      });
  }

  /**
   * Confirms logout and clears session
   */
  confirmLogout(): void {
    this.closeModal();
    this.authService.logout();
  }

  private resetPasswordForm(): void {
    this.changePasswordForm.reset();
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.isSubmittingPassword.set(false);
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }
}
