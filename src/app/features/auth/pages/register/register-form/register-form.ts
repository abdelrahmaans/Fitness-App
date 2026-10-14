import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { AuthHeading } from '../../../../../shared/ui/auth-heading/auth-heading';
import { AuthInput } from '../../../../../shared/ui/auth-input/auth-input';
import { AuthLink } from '../../../../../shared/ui/auth-link/auth-link';
import { AuthOrDivider } from '../../../../../shared/ui/auth-or-divider/auth-or-divider';
import { AuthSocialMediaIcons } from '../../../../../shared/ui/auth-social-media-icons/auth-social-media-icons';
import { authPasswordsMatchValidator } from '../../../../../shared/utils/auth-password-match';
import { RegisterService } from '../../../services/register/register.service';
import { strongPasswordValidator } from '../../../validators/auth.validators';

import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register-form',
  host: { class: 'block w-full max-w-[486px]' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthHeading,
    AuthInput,
    AuthLink,
    AuthButton,
    AuthOrDivider,
    AuthSocialMediaIcons,
    TranslatePipe,
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterForm {
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly form = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, strongPasswordValidator()],
      }),
      rePassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [authPasswordsMatchValidator('password', 'rePassword')],
    },
  );

  constructor() {
    const draft = this.registerService.draftData();
    if (draft) {
      this.form.patchValue(draft);
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.registerService.updateDraft(this.form.getRawValue());
    void this.router.navigateByUrl('/auth/register/gender');
  }
}

