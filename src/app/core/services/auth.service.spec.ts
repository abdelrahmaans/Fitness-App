import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/auth.constants';
import type { AuthUser, LoginRequest, RegisterFormRequest } from '../models/auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('initializes with unauthenticated state when storage is empty', () => {
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();

    let isAuth: boolean | undefined;
    service.isAuthenticated$.subscribe((val) => (isAuth = val));
    expect(isAuth).toBe(false);

    let currentUser: AuthUser | null | undefined;
    service.currentUser$.subscribe((val) => (currentUser = val));
    expect(currentUser).toBeNull();
  });

  it('performs login, saves token and user, and broadcasts state to RxJS subjects', () => {
    const credentials: LoginRequest = { email: 'user@example.com', password: 'Password1!' };
    const mockUser: AuthUser = { email: 'user@example.com', firstName: 'John' };
    const mockToken = 'mock-jwt-token';

    let isAuth: boolean | undefined;
    service.isAuthenticated$.subscribe((val) => (isAuth = val));

    let currentUser: AuthUser | null | undefined;
    service.currentUser$.subscribe((val) => (currentUser = val));

    service.login(credentials).subscribe((res) => {
      expect(res.token).toBe(mockToken);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/signin`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush({ token: mockToken, user: mockUser });

    expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBe(mockToken);
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toBe(JSON.stringify(mockUser));
    expect(isAuth).toBe(true);
    expect(currentUser).toEqual(mockUser);
    expect(service.getToken()).toBe(mockToken);
    expect(service.getUser()).toEqual(mockUser);
  });

  it('performs signup, saves credentials, and updates reactive state', () => {
    const signupData: RegisterFormRequest = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
      rePassword: 'Password1!',
    };
    const mockUser: AuthUser = { firstName: 'Jane', email: 'jane@example.com' };

    service.signup(signupData).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/signup`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'success', token: 'signup-token', user: mockUser });

    expect(service.getToken()).toBe('signup-token');
    expect(service.getUser()).toEqual(mockUser);
  });

  it('handles forgotPassword API request', () => {
    service.forgotPassword('user@example.com').subscribe((res) => {
      expect(res.message).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/forgotPassword`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@example.com' });
    req.flush({ message: 'success' });
  });

  it('handles verifyResetCode API request', () => {
    service.verifyResetCode('123456').subscribe((res) => {
      expect(res.status).toBe('Success');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/verifyResetCode`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ resetCode: '123456' });
    req.flush({ status: 'Success' });
  });

  it('handles resetPassword API request', () => {
    service.resetPassword({ email: 'user@example.com', newPassword: 'NewPassword1!' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/resetPassword`);
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'Password reset successful', token: 'new-token' });

    expect(service.getToken()).toBe('new-token');
  });

  it('logout completely clears user state and storage, then navigates to login', () => {
    service.saveToken('token-to-clear', { email: 'logout@example.com' });
    expect(service.getToken()).toBe('token-to-clear');

    service.logout();

    expect(sessionStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();

    let isAuth: boolean | undefined;
    service.isAuthenticated$.subscribe((val) => (isAuth = val));
    expect(isAuth).toBe(false);

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('updates user profile data reactively', () => {
    const updatedUser: AuthUser = { firstName: 'Updated', email: 'updated@example.com' };
    service.updateUserProfile(updatedUser);

    expect(service.getUser()).toEqual(updatedUser);
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toBe(JSON.stringify(updatedUser));
  });

  it('parses API errors correctly', () => {
    expect(service.readError({ error: 'Invalid credentials' })).toBe('Invalid credentials');
    expect(service.readError({ message: 'Token expired' })).toBe('Token expired');
    expect(service.readError(null)).toBe('Something went wrong');
  });
});
