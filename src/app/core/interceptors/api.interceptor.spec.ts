import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_KEY } from '../constants/auth.constants';
import type { SupportedLanguage } from '../models/translation.models';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const currentLangSignal = signal<SupportedLanguage>('en');

  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    currentLang: typeof currentLangSignal;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    currentLangSignal.set('en');

    authServiceMock = {
      getToken: vi.fn().mockReturnValue(null),
      clearSession: vi.fn(),
    };

    translationServiceMock = {
      currentLang: currentLangSignal,
    };

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches Accept-Language header matching current language signal', () => {
    currentLangSignal.set('ar');

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    expect(req.request.headers.get('Accept-Language')).toBe('ar');
    req.flush({});
  });

  it('attaches Bearer token from localStorage when available', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'stored-local-token');

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer stored-local-token');
    expect(req.request.headers.get('Accept-Language')).toBe('en');
    req.flush({});
  });

  it('attaches Bearer token from AuthService when token exists in service', () => {
    authServiceMock.getToken.mockReturnValue('service-token-123');

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer service-token-123');
    req.flush({});
  });

  it('bypasses static translation asset requests and prevents circular dependency', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'some-token');

    httpClient.get('/in18/en.json').subscribe();

    const req = httpMock.expectOne('/in18/en.json');
    // Static asset should bypass interceptor headers entirely
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.headers.has('Accept-Language')).toBe(false);
    req.flush({});
  });

  it('does not attach Authorization header to external third-party requests', () => {
    authServiceMock.getToken.mockReturnValue('valid-token');

    httpClient.get('https://external-api.com/data').subscribe();

    const req = httpMock.expectOne('https://external-api.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.headers.get('Accept-Language')).toBe('en');
    req.flush({});
  });

  it('clears session and redirects to /auth/login on 401 error for API request', () => {
    let caughtError: HttpErrorResponse | undefined;

    httpClient.get(`${environment.apiBaseUrl}/user/profile`).subscribe({
      error: (err: HttpErrorResponse) => {
        caughtError = err;
      },
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/user/profile`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.clearSession).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(caughtError?.status).toBe(401);
  });
});
