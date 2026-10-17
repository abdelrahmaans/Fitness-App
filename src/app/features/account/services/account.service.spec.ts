import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        AccountService,
      ],
    });

    service = TestBed.inject(AccountService);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call PUT /auth/editProfile and update user session', () => {
    const payload = { goal: 'Lose Weight' };
    const mockUser = {
      _id: '123',
      email: 'test@elevate.com',
      goal: 'Lose Weight',
      activityLevel: 'level2',
      weight: 90,
    };

    service.editProfile(payload).subscribe((res) => {
      expect(res.message).toBe('success');
      expect(res.user.goal).toBe('Lose Weight');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/editProfile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({ message: 'success', user: mockUser });
    expect(authService.getUser()?.goal).toBe('Lose Weight');
  });

  it('should correctly resolve activity level label', () => {
    expect(service.getActivityLevelLabel('level1')).toBe('Rookie');
    expect(service.getActivityLevelLabel('level2')).toBe('Beginner');
    expect(service.getActivityLevelLabel('level3')).toBe('Intermediate');
    expect(service.getActivityLevelLabel('level4')).toBe('Advance');
    expect(service.getActivityLevelLabel('level5')).toBe('True Beast');
    expect(service.getActivityLevelLabel(undefined)).toBe('Beginner');
  });

  it('should correctly resolve activity level value', () => {
    expect(service.getActivityLevelValue('Beginner')).toBe('level2');
    expect(service.getActivityLevelValue('level2')).toBe('level2');
  });
});
