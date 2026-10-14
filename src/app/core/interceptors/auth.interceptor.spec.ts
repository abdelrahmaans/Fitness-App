import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: {
    getToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      getToken: vi.fn(),
      clearSession: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches Bearer token to API request when token exists', () => {
    authService.getToken.mockReturnValue('jwt-token-xyz');

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-xyz');
    req.flush({});
  });

  it('does not attach Authorization header when token is null', () => {
    authService.getToken.mockReturnValue(null);

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not attach Authorization header to external third-party requests', () => {
    authService.getToken.mockReturnValue('jwt-token-xyz');

    httpClient.get('https://external-api.com/data').subscribe();

    const req = httpMock.expectOne('https://external-api.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('clears session and redirects to /auth/login on 401 error', () => {
    authService.getToken.mockReturnValue('expired-token');

    let errorResponse: HttpErrorResponse | undefined;
    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe({
      error: (err: HttpErrorResponse) => {
        errorResponse = err;
      },
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(errorResponse?.status).toBe(401);
  });

  it('does not redirect or clear session on non-401 error (e.g. 500)', () => {
    authService.getToken.mockReturnValue('valid-token');

    let errorResponse: HttpErrorResponse | undefined;
    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe({
      error: (err: HttpErrorResponse) => {
        errorResponse = err;
      },
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });

    expect(authService.clearSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(errorResponse?.status).toBe(500);
  });
});
