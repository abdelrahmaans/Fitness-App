import { Component, inject, model, signal } from '@angular/core';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthNumberPicker } from '../../../../../shared/ui/auth-number-picker/auth-number-picker';
import { RegisterService } from '../../../services/register/register.service';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-height',
  imports: [AuthHeading, AuthNumberPicker, AuthButton, TranslatePipe],
  templateUrl: './height.html',
  styleUrl: './height.scss',
})
export class Height {
private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly height = signal<number>(
    this.registerService.draftData().height ?? 167
  );

  protected onNext(): void {
    const selectedHeight = this.height();
    if (!selectedHeight) return;

    this.registerService.updateDraft({ height: selectedHeight });

    void this.router.navigateByUrl('/auth/register/goal');
  }
}
