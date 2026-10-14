import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '../../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthRadioButton, type RadioOption } from '../../../../../shared/ui/auth-radio-button/auth-radio-button';
import { RegisterService } from '../../../services/register/register.service';

@Component({
  selector: 'app-onboarding-goal',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [AuthHeading, AuthButton, AuthRadioButton, TranslatePipe],
  templateUrl: './onboarding-goal.html',
  styleUrl: './onboarding-goal.scss',
})
export class OnboardingGoal {
  private readonly registerService = inject(RegisterService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  readonly goal = signal<string | undefined>(this.registerService.draftData().goal);

  readonly goals = computed<RadioOption<string>[]>(() => [
    { id: '1', label: this.translationService.translate('ONBOARDING.GOAL.GAIN_WEIGHT'), value: 'Gain Weight' },
    { id: '2', label: this.translationService.translate('ONBOARDING.GOAL.LOSE_WEIGHT'), value: 'Lose Weight' },
    { id: '3', label: this.translationService.translate('ONBOARDING.GOAL.GET_FITTER'), value: 'Get Fitter' },
    { id: '4', label: this.translationService.translate('ONBOARDING.GOAL.GAIN_FLEXIBLE'), value: 'Gain More Flexible' },
    { id: '5', label: this.translationService.translate('ONBOARDING.GOAL.LEARN_BASIC'), value: 'Learn The Basic' },
  ]);

  protected onNext(): void {
    this.registerService.updateDraft({ goal: this.goal() });
    void this.router.navigateByUrl('/auth/register/activity-level');
  }
}

