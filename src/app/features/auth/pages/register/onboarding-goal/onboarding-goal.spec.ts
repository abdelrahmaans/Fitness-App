import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { OnboardingGoal } from './onboarding-goal';
import { RegisterService } from '../../../services/register/register.service';
import { SignupDraft } from '../../../models/register/register.models';

describe('OnboardingGoal', () => {
  let component: OnboardingGoal;
  let fixture: ComponentFixture<OnboardingGoal>;
  let mockRegisterService: any;
  let mockRouter: any;
  let mockDraftData = signal<SignupDraft>({});

  beforeEach(async () => {
    mockRegisterService = {
      updateDraft: vi.fn(),
      draftData: mockDraftData
    };
    mockRouter = {
      navigateByUrl: vi.fn()
    };
    mockDraftData.set({}); // Reset draft data before each test

    await TestBed.configureTestingModule({
      imports: [OnboardingGoal],
      providers: [
        { provide: RegisterService, useValue: mockRegisterService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingGoal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize goal as undefined if draft is empty', () => {
    expect(component.goal()).toBeUndefined();
  });

  it('should initialize goal from draft data if present', () => {
    mockDraftData.set({ goal: 'Get Fitter' });
    
    // Recreate component to test initialization
    fixture = TestBed.createComponent(OnboardingGoal);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.goal()).toBe('Get Fitter');
  });

  it('should pass disabled=true to Next button when goal is undefined', () => {
    const button = fixture.debugElement.query(By.css('app-auth-button'));
    expect(button.componentInstance.disabled()).toBe(true);
  });

  it('should pass disabled=false to Next button when goal is selected', () => {
    component.goal.set('Lose Weight');
    fixture.detectChanges();
    
    const button = fixture.debugElement.query(By.css('app-auth-button'));
    expect(button.componentInstance.disabled()).toBe(false);
  });

  it('should update draft and navigate to next step on onNext()', () => {
    component.goal.set('Gain Weight');
    
    // Access protected method for testing
    (component as any).onNext();
    
    expect(mockRegisterService.updateDraft).toHaveBeenCalledWith({ goal: 'Gain Weight' });
  });
});
