import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslationService } from '../../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthError } from '../../../../../shared/ui/auth-error/auth-error';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthRadioButton, type RadioOption } from '../../../../../shared/ui/auth-radio-button/auth-radio-button';
import { RegisterService } from '../../../services/register/register.service';

@Component({
  selector: 'app-onboarding-activity-level',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [AuthHeading, AuthButton, AuthRadioButton, AuthError, TranslatePipe],
  templateUrl: './onboarding-activity-level.html',
  styleUrl: './onboarding-activity-level.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingActivityLevel {
  private readonly registerService = inject(RegisterService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly activityLevel = signal<string | undefined>(this.registerService.draftData().activityLevel);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | undefined>(undefined);

  readonly activityLevels = computed<RadioOption<string>[]>(() => [
    { id: '1', label: this.translationService.translate('ONBOARDING.ACTIVITY.ROOKIE'), value: 'level1' },
    { id: '2', label: this.translationService.translate('ONBOARDING.ACTIVITY.BEGINNER'), value: 'level2' },
    { id: '3', label: this.translationService.translate('ONBOARDING.ACTIVITY.INTERMEDIATE'), value: 'level3' },
    { id: '4', label: this.translationService.translate('ONBOARDING.ACTIVITY.ADVANCE'), value: 'level4' },
    { id: '5', label: this.translationService.translate('ONBOARDING.ACTIVITY.TRUE_BEAST'), value: 'level5' },
  ]);

  protected onNext(): void {
    this.registerService.updateDraft({ activityLevel: this.activityLevel() });
    this.isSubmitting.set(true);
    this.errorMessage.set(undefined);

    const draft = this.registerService.draftData();
    this.registerService
      .signup(draft)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.registerService.saveToken(response.token, response.user);
          this.registerService.clearDraft();
          void this.router.navigateByUrl('/home');
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(this.registerService.readRegisterError(err.error));
        },
      });
  }
}
