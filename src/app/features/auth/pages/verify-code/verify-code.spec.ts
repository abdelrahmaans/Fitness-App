import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordService } from '../../services/forgot-password/forgot-password.service';
import { VerifyCode } from './verify-code';

describe('VerifyCode', () => {
  let fixture: ComponentFixture<VerifyCode>;
  let component: VerifyCode;
  let forgotPasswordService: {
    recoveryEmail: ReturnType<typeof vi.fn>;
    verifyResetCode: ReturnType<typeof vi.fn>;
    forgotPassword: ReturnType<typeof vi.fn>;
    setResetCode: ReturnType<typeof vi.fn>;
    setCodeVerified: ReturnType<typeof vi.fn>;
    readError: ReturnType<typeof vi.fn>;
  };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    forgotPasswordService = {
      recoveryEmail: vi.fn().mockReturnValue('user@example.com'),
      verifyResetCode: vi.fn(),
      forgotPassword: vi.fn(),
      setResetCode: vi.fn(),
      setCodeVerified: vi.fn(),
      readError: vi.fn().mockReturnValue('Invalid code'),
    };
    router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [VerifyCode],
      providers: [
        { provide: ForgotPasswordService, useValue: forgotPasswordService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits verification code and navigates to /auth/reset-password on success', () => {
    forgotPasswordService.verifyResetCode.mockReturnValue(of({ status: 'Success' }));

    (component as unknown as { otpCode: { set: (v: string) => void } }).otpCode.set('123456');
    (component as unknown as { onConfirm: () => void }).onConfirm();

    expect(forgotPasswordService.verifyResetCode).toHaveBeenCalledWith('123456');
    expect(forgotPasswordService.setResetCode).toHaveBeenCalledWith('123456');
    expect(forgotPasswordService.setCodeVerified).toHaveBeenCalledWith(true);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/reset-password');
  });

  it('displays error message when verification code is invalid', () => {
    forgotPasswordService.verifyResetCode.mockReturnValue(
      throwError(() => ({ error: { error: 'Invalid code' } })),
    );

    (component as unknown as { otpCode: { set: (v: string) => void } }).otpCode.set('000000');
    (component as unknown as { onConfirm: () => void }).onConfirm();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-auth-error');
    expect(errorEl).not.toBeNull();
  });

  it('resends code on click of resend link', () => {
    forgotPasswordService.forgotPassword.mockReturnValue(of({ message: 'success' }));

    (component as unknown as { onResend: () => void }).onResend();
    fixture.detectChanges();

    expect(forgotPasswordService.forgotPassword).toHaveBeenCalledWith('user@example.com');
  });
});
