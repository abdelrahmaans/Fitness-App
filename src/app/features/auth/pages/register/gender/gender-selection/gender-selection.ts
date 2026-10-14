import { Component, inject, model, signal } from '@angular/core';
import { AuthButton } from '../../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../../shared/ui/auth-heading/auth-heading';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterService } from '../../../../services/register/register.service';

import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';

type Gender = 'male' | 'female' | null;

@Component({
  selector: 'app-gender-selection',
  imports: [AuthHeading, AuthButton, CommonModule, TranslatePipe],
  templateUrl: './gender-selection.html',
  styleUrl: './gender-selection.scss',
})
export class GenderSelection {

private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly gender = signal<Gender|null>(
    this.registerService.draftData().gender ?? null
  );

  selectGender(gender: Gender): void {
    this.gender.set(gender);
  }

  protected onNext(): void {
    const selectedGender = this.gender();
    if (!selectedGender) return;

    this.registerService.updateDraft({ gender: selectedGender });
    void this.router.navigateByUrl('/auth/register/age'); // Adjust path as needed
  }
}
