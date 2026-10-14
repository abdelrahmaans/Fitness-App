import { Component, inject, model, signal } from '@angular/core';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthNumberPicker } from '../../../../../shared/ui/auth-number-picker/auth-number-picker';
import { RegisterService } from '../../../services/register/register.service';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-weight',
  imports: [AuthHeading, AuthNumberPicker, AuthButton, TranslatePipe],
  templateUrl: './weight.html',
  styleUrl: './weight.scss',
})
export class Weight {
private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly weight = signal<number>(
    this.registerService.draftData().weight ?? 90
  );

  protected onNext(): void {
    const selectedWeight = this.weight();
    if (!selectedWeight) return;

    this.registerService.updateDraft({ weight: selectedWeight });

    void this.router.navigateByUrl('/auth/register/height');
  }
}
