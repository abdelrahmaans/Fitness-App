import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { ForgotPasswordService } from './forgot-password.service';

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [ForgotPasswordService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ForgotPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('sends POST request to /auth/forgotPassword', () => {
    const email = 'user@example.com';
    service.forgotPassword(email).subscribe((res) => {
      expect(res.message).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/forgotPassword`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email });
    req.flush({ message: 'success' });
  });

  it('sends POST request to /auth/verifyResetCode', () => {
    const resetCode = '123456';
    service.verifyResetCode(resetCode).subscribe((res) => {
      expect(res.status).toBe('Success');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/verifyResetCode`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ resetCode });
    req.flush({ status: 'Success' });
  });

  it('sends PUT request to /auth/resetPassword', () => {
    const payload = { email: 'user@example.com', newPassword: 'NewPassword1!' };
    service.resetPassword(payload).subscribe((res) => {
      expect(res.token).toBe('new-token');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/resetPassword`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'new-token' });
  });

  it('manages recovery state and session storage', () => {
    expect(service.recoveryEmail()).toBeNull();

    service.setEmail('test@example.com');
    expect(service.recoveryEmail()).toBe('test@example.com');

    service.setResetCode('987654');
    expect(service.resetCode()).toBe('987654');

    service.setCodeVerified(true);
    expect(service.isCodeVerified()).toBe(true);

    service.clearRecoveryState();
    expect(service.recoveryEmail()).toBeNull();
    expect(service.resetCode()).toBeNull();
    expect(service.isCodeVerified()).toBe(false);
  });

  it('parses error messages correctly', () => {
    expect(service.readError({ error: 'User not found' })).toBe('User not found');
    expect(service.readError({ message: 'Invalid code' })).toBe('Invalid code');
    expect(service.readError(null)).toBe('Something went wrong');
  });
});
