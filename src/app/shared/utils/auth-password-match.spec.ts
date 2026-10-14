import { FormControl, FormGroup } from '@angular/forms';
import { authPasswordsMatchValidator } from './auth-password-match';

describe('authPasswordsMatchValidator', () => {
  function createGroup(password = '', confirmPassword = '') {
    return new FormGroup(
      {
        password: new FormControl(password, { nonNullable: true }),
        confirmPassword: new FormControl(confirmPassword, { nonNullable: true }),
      },
      { validators: authPasswordsMatchValidator() },
    );
  }

  it('passes when confirm is empty', () => {
    const group = createGroup('secret', '');
    expect(group.valid).toBe(true);
    expect(group.get('confirmPassword')?.errors).toBeNull();
  });

  it('passes when values match', () => {
    const group = createGroup('secret', 'secret');
    expect(group.valid).toBe(true);
  });

  it('flags mismatch on confirm password', () => {
    const group = createGroup('secret', 'other');
    expect(group.errors).toEqual({ passwordMismatch: true });
    expect(group.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
  });

  it('clears mismatch when confirm is corrected', () => {
    const group = createGroup('secret', 'other');
    group.get('confirmPassword')?.setValue('secret');
    expect(group.valid).toBe(true);
    expect(group.get('confirmPassword')?.errors).toBeNull();
  });
});
