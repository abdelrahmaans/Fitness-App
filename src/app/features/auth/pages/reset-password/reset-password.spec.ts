import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let fixture: ComponentFixture<ResetPassword>;
  let component: ResetPassword;
  let forgotPasswordService: {
    recoveryEmail: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    clearRecoveryState: ReturnType<typeof vi.fn>;
    readError: ReturnType<typeof vi.fn>;
  };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    forgotPasswordService = {
      recoveryEmail: vi.fn().mockReturnValue('user@example.com'),
      resetPassword: vi.fn(),
      clearRecoveryState: vi.fn(),
      readError: vi.fn().mockReturnValue('Reset failed'),
    };
    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        { provide: ForgotPasswordService, useValue: forgotPasswordService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('validates password requirement and matching passwords', () => {
    component.form.controls.password.setValue('Weak');
    component.form.controls.confirmPassword.setValue('Weak');
    expect(component.form.controls.password.hasError('strongPassword')).toBe(true);

    component.form.controls.password.setValue('StrongPass1!');
    component.form.controls.confirmPassword.setValue('DifferentPass1!');
    component.form.updateValueAndValidity();
    expect(component.form.controls.confirmPassword.hasError('passwordMismatch')).toBe(true);

    component.form.controls.confirmPassword.setValue('StrongPass1!');
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBe(true);
  });

  it('submits valid new password and navigates to /auth/login on success', () => {
    forgotPasswordService.resetPassword.mockReturnValue(of({ token: 'new-token' }));

    component.form.controls.password.setValue('StrongPass1!');
    component.form.controls.confirmPassword.setValue('StrongPass1!');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(forgotPasswordService.resetPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      newPassword: 'StrongPass1!',
    });
    expect(forgotPasswordService.clearRecoveryState).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('displays error message when resetPassword fails', () => {
    forgotPasswordService.resetPassword.mockReturnValue(
      throwError(() => ({ error: { error: 'Error resetting password' } })),
    );

    component.form.controls.password.setValue('StrongPass1!');
    component.form.controls.confirmPassword.setValue('StrongPass1!');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-auth-error');
    expect(errorEl).not.toBeNull();
  });
});
