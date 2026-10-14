import type { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function authPasswordsMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const password = group.get(passwordKey);
    const confirm = group.get(confirmKey);

    if (!password || !confirm) {
      return null;
    }

    const mismatch = !!confirm.value && password.value !== confirm.value;

    if (mismatch) {
      confirm.setErrors({ ...(confirm.errors ?? {}), passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirm.errors?.['passwordMismatch']) {
      const { passwordMismatch: _, ...rest } = confirm.errors;
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}
