import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { vi } from 'vitest';
import { of, throwError, NEVER } from 'rxjs';
import { OnboardingActivityLevel } from './onboarding-activity-level';
import { RegisterService } from '../../../services/register/register.service';
import { SignupDraft } from '../../../models/register/register.models';
import { AuthButton } from '../../../../../shared/ui/auth-button/auth-button';
import { environment } from '../../../../../../environments/environment';

interface MockRegisterService {
  updateDraft: ReturnType<typeof vi.fn>;
  draftData: WritableSignal<SignupDraft>;
  signup: ReturnType<typeof vi.fn>;
  saveToken: ReturnType<typeof vi.fn>;
  clearDraft: ReturnType<typeof vi.fn>;
  readRegisterError: ReturnType<typeof vi.fn>;
}

interface MockRouter {
  navigateByUrl: ReturnType<typeof vi.fn>;
}

describe('OnboardingActivityLevel', () => {
  let component: OnboardingActivityLevel;
  let fixture: ComponentFixture<OnboardingActivityLevel>;
  let mockRegisterService: MockRegisterService;
  let mockRouter: MockRouter;
  let mockDraftData: WritableSignal<SignupDraft>;
  let httpTesting: HttpTestingController;

  const draftWithFormData: SignupDraft = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'StrongPass1!',
    rePassword: 'StrongPass1!',
    age: 25,
    goal: 'Get Fitter',
  };

  beforeEach(async () => {
    mockDraftData = signal<SignupDraft>({ ...draftWithFormData });
    mockRegisterService = {
      updateDraft: vi.fn().mockImplementation((data: Partial<SignupDraft>) => {
        mockDraftData.update((prev) => ({ ...prev, ...data }));
      }),
      draftData: mockDraftData,
      signup: vi.fn(),
      saveToken: vi.fn(),
      clearDraft: vi.fn(),
      readRegisterError: vi.fn().mockReturnValue('Something went wrong'),
    };
    mockRouter = {
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OnboardingActivityLevel],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RegisterService, useValue: mockRegisterService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OnboardingActivityLevel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 activity level options with API values', () => {
    expect(component.activityLevels()).toHaveLength(5);
    expect(component.activityLevels().map((opt) => opt.value)).toEqual([
      'level1',
      'level2',
      'level3',
      'level4',
      'level5',
    ]);
    expect(component.activityLevels().map((opt) => opt.label)).toEqual([
      'Rookie',
      'Beginner',
      'Intermediate',
      'Advance',
      'True Beast',
    ]);
  });

  it('should initialize activityLevel as undefined if draft has no activityLevel', () => {
    mockDraftData.set({ ...draftWithFormData });

    fixture = TestBed.createComponent(OnboardingActivityLevel);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.activityLevel()).toBeUndefined();
  });

  it('should initialize activityLevel from draft data if present', () => {
    mockDraftData.set({ ...draftWithFormData, activityLevel: 'level3' });

    fixture = TestBed.createComponent(OnboardingActivityLevel);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.activityLevel()).toBe('level3');
  });

  it('should pass disabled=true to Next button when activityLevel is undefined', () => {
    const button = fixture.debugElement.query(By.directive(AuthButton));
    expect(button.componentInstance.disabled()).toBe(true);
  });

  it('should pass disabled=false to Next button when activityLevel is selected', () => {
    component.activityLevel.set('level4');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    expect(button.componentInstance.disabled()).toBe(false);
  });

  it('should update draft with selected activityLevel on onNext()', () => {
    mockRegisterService.signup.mockReturnValue(NEVER);
    component.activityLevel.set('level5');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    button.componentInstance.clicked.emit();

    expect(mockRegisterService.updateDraft).toHaveBeenCalledWith({ activityLevel: 'level5' });
  });

  it('should call signup with full draft data on onNext()', () => {
    mockRegisterService.signup.mockReturnValue(
      of({ message: 'ok', user: {}, token: 'abc123' }),
    );

    component.activityLevel.set('level1');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    button.componentInstance.clicked.emit();

    expect(mockRegisterService.signup).toHaveBeenCalledWith(
      expect.objectContaining({ activityLevel: 'level1' }),
    );
  });

  it('should save token, clear draft and navigate to /home on signup success', () => {
    const mockResponse = { message: 'ok', user: {}, token: 'abc123' };
    mockRegisterService.signup.mockReturnValue(of(mockResponse));

    component.activityLevel.set('level2');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    button.componentInstance.clicked.emit();

    expect(mockRegisterService.saveToken).toHaveBeenCalledWith('abc123', mockResponse.user);
    expect(mockRegisterService.clearDraft).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('should set errorMessage and stop submitting on signup failure', () => {
    mockRegisterService.signup.mockReturnValue(
      throwError(() => ({ error: { error: 'Email already exists' } })),
    );
    mockRegisterService.readRegisterError.mockReturnValue('Email already exists');

    component.activityLevel.set('level3');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    button.componentInstance.clicked.emit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Email already exists');
    expect(component.isSubmitting()).toBe(false);
  });

  it('should disable button while submitting', () => {
    mockRegisterService.signup.mockReturnValue(NEVER);

    component.activityLevel.set('level1');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(AuthButton));
    button.componentInstance.clicked.emit();
    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(true);
    expect(button.componentInstance.disabled()).toBe(true);
  });
});
