import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { RegisterService } from './register.service';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts signup body', () => {
    const body = {
      firstName: 'Mathew',
      lastName: 'Samir',
      email: 'mthwsamir@gmail.com',
      password: 'Secret@123',
      rePassword: 'Secret@123',
    };

    service.signup(body).subscribe((response) => {
      expect(response.message).toBe('success');
      expect(response.token).toBe('jwt');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ message: 'success', user: {}, token: 'jwt' });
  });

  it('reads error message from API error body', () => {
    expect(service.readRegisterError({ error: 'Email already exists' })).toBe(
      'Email already exists',
    );
  });

  it('returns fallback for unknown error shape', () => {
    expect(service.readRegisterError(null)).toBe('Something went wrong');
  });
});
