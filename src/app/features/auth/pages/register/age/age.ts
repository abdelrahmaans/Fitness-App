import { Component, inject, model } from '@angular/core';
import { Router } from '@angular/router';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthNumberPicker } from '../../../../../shared/ui/auth-number-picker/auth-number-picker';
import { RegisterService } from '../../../services/register/register.service';

import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register-age',
  imports: [AuthHeading, AuthNumberPicker, AuthButton, TranslatePipe],
  templateUrl: './age.html',
  styleUrl: './age.scss',
})
export class RegisterAge {
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly age = model(this.registerService.draftData().age ?? 25);

  protected onNext(): void {
    this.registerService.updateDraft({ age: this.age() });
    void this.router.navigateByUrl('/auth/register/weight');
  }
}
