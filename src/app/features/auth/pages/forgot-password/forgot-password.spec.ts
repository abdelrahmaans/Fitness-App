import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;
  let component: ForgotPassword;
  let forgotPasswordService: {
    recoveryEmail: ReturnType<typeof vi.fn>;
    forgotPassword: ReturnType<typeof vi.fn>;
    setEmail: ReturnType<typeof vi.fn>;
    readError: ReturnType<typeof vi.fn>;
    clearRecoveryState: ReturnType<typeof vi.fn>;
  };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    forgotPasswordService = {
      recoveryEmail: vi.fn().mockReturnValue(''),
      forgotPassword: vi.fn(),
      setEmail: vi.fn(),
      readError: vi.fn().mockReturnValue('User not found'),
      clearRecoveryState: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        { provide: ForgotPasswordService, useValue: forgotPasswordService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('validates email field as required and valid format', () => {
    const emailControl = component.form.controls.email;
    expect(emailControl.valid).toBe(false);

    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('valid@example.com');
    expect(emailControl.valid).toBe(true);
  });

  it('calls forgotPassword service and navigates on success', () => {
    forgotPasswordService.forgotPassword.mockReturnValue(of({ message: 'success' }));
    component.form.controls.email.setValue('user@example.com');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(forgotPasswordService.forgotPassword).toHaveBeenCalledWith('user@example.com');
    expect(forgotPasswordService.setEmail).toHaveBeenCalledWith('user@example.com');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/verify-code');
  });

  it('displays error message when request fails', () => {
    forgotPasswordService.forgotPassword.mockReturnValue(
      throwError(() => ({ error: { error: 'User not found' } })),
    );
    component.form.controls.email.setValue('unknown@example.com');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-auth-error');
    expect(errorEl).not.toBeNull();
    expect(forgotPasswordService.readError).toHaveBeenCalled();
  });

  it('disables submit button while submitting', () => {
    forgotPasswordService.forgotPassword.mockReturnValue(new Subject());
    component.form.controls.email.setValue('user@example.com');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
