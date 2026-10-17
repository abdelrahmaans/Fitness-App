import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideLoader2, LucideRotateCw, LucideX } from '@lucide/angular';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthNumberPicker } from '../../../../shared/ui/auth-number-picker/auth-number-picker';
import { AuthRadioButton, type RadioOption } from '../../../../shared/ui/auth-radio-button/auth-radio-button';
import {
  ACTIVITY_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  type BasicMetricType,
} from '../../models/account.models';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-basic-metrics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    AuthRadioButton,
    AuthNumberPicker,
    LucideRotateCw,
    LucideX,
    LucideLoader2,
  ],
  templateUrl: './basic-metrics.html',
  styleUrl: './basic-metrics.scss',
})
export class BasicMetrics implements OnInit {
  protected readonly accountService = inject(AccountService);
  protected readonly translationService = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Currently logged in user profile */
  readonly currentUser = this.accountService.userProfile;

  /** Active modal type or null if closed */
  readonly activeModal = signal<BasicMetricType | null>(null);

  /** Form states for the modal */
  readonly tempGoal = signal<string>('Lose Weight');
  readonly tempLevel = signal<string>('level2');
  readonly tempWeight = signal<number>(90);

  /** Loading state during metric update */
  readonly isSaving = this.accountService.isUpdating;
  readonly errorMessage = signal<string | null>(null);

  /** Display values matching current user profile with safe fallbacks */
  readonly displayGoal = computed(() => this.currentUser()?.goal || 'Lose Weight');

  readonly displayLevel = computed(() =>
    this.accountService.getActivityLevelLabel(this.currentUser()?.activityLevel),
  );

  readonly displayWeight = computed(() => {
    const w = this.currentUser()?.weight ?? 90;
    return `${w} Kg`;
  });

  /** Radio options for Goal modal */
  readonly goalRadioOptions = computed<RadioOption<string>[]>(() =>
    GOAL_OPTIONS.map((g) => ({
      id: g.id,
      label: this.translationService.translate(g.labelKey),
      value: g.value,
    })),
  );

  /** Radio options for Level modal */
  readonly levelRadioOptions = computed<RadioOption<string>[]>(() =>
    ACTIVITY_LEVEL_OPTIONS.map((l) => ({
      id: l.id,
      label: this.translationService.translate(l.labelKey),
      value: l.value,
    })),
  );

  ngOnInit(): void {
    // Refresh user profile data from API on component initialization
    this.accountService
      .getProfileData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Opens the edit modal for a specific metric (Goal, Level, or Weight)
   */
  openModal(type: BasicMetricType): void {
    this.errorMessage.set(null);

    if (type === 'goal') {
      this.tempGoal.set(this.displayGoal());
    } else if (type === 'level') {
      this.tempLevel.set(
        this.accountService.getActivityLevelValue(this.currentUser()?.activityLevel),
      );
    } else if (type === 'weight') {
      this.tempWeight.set(this.currentUser()?.weight ?? 90);
    }

    this.activeModal.set(type);
  }

  /**
   * Closes the active edit modal
   */
  closeModal(): void {
    this.activeModal.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Submits the updated metric to the backend API via editProfile
   */
  saveMetric(): void {
    const modalType = this.activeModal();
    if (!modalType || this.isSaving()) return;

    this.errorMessage.set(null);
    let payload: Record<string, unknown> = {};

    if (modalType === 'goal') {
      payload = { goal: this.tempGoal() };
    } else if (modalType === 'level') {
      payload = { activityLevel: this.tempLevel() };
    } else if (modalType === 'weight') {
      payload = { weight: this.tempWeight() };
    }

    this.accountService
      .editProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err: unknown) => {
          const message =
            (err as { error?: { message?: string } })?.error?.message ||
            'Failed to update metric. Please try again.';
          this.errorMessage.set(message);
        },
      });
  }
}
