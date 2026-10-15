import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation.service';
import { AccountService } from '../../services/account.service';
import { BasicMetrics } from './basic-metrics';

describe('BasicMetrics Component', () => {
  let fixture: ComponentFixture<BasicMetrics>;
  let component: BasicMetrics;

  const mockUserSignal = signal({
    _id: 'usr-123',
    goal: 'Lose Weight',
    activityLevel: 'level2',
    weight: 90,
  });

  const mockAccountService = {
    userProfile: mockUserSignal,
    isUpdating: signal(false),
    getProfileData: vi.fn(() => of(mockUserSignal())),
    editProfile: vi.fn((payload: unknown) =>
      of({
        message: 'success',
        user: { ...mockUserSignal(), ...(payload as object) },
      }),
    ),
    getActivityLevelLabel: vi.fn((lvl: string) => (lvl === 'level2' ? 'Beginner' : lvl)),
    getActivityLevelValue: vi.fn((lvl: string) => (lvl === 'Beginner' ? 'level2' : lvl)),
  };

  const mockTranslationService = {
    currentLang: signal('en'),
    direction: signal('ltr'),
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'ACCOUNT.YOUR_GOAL': 'Your Goal',
        'ACCOUNT.LEVEL': 'Level',
        'ACCOUNT.WEIGHT': 'Weight',
        'ACCOUNT.TAP_TO_CHANGE': 'TAP TO CHANGE',
        'ACCOUNT.MODAL.WHAT_IS_YOUR_GOAL': 'What Is Your Goal ?',
        'ACCOUNT.MODAL.WHAT_IS_YOUR_LEVEL': 'What Is Your Fitness Level ?',
        'ACCOUNT.MODAL.WHAT_IS_YOUR_WEIGHT': 'What Is Your Weight ?',
        'ACCOUNT.MODAL.SUBTITLE': 'This Helps Us Create Your Personalized Plan',
        'ACCOUNT.MODAL.NEXT': 'Next',
        'ACCOUNT.MODAL.SAVE': 'Save',
        'ACCOUNT.MODAL.UPDATING': 'Updating...',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [BasicMetrics],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicMetrics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the BasicMetrics component', () => {
    expect(component).toBeTruthy();
  });

  it('should display three main sections side-by-side representing vital metrics', () => {
    const cards = fixture.nativeElement.querySelectorAll('.basic-metrics__card');
    expect(cards.length).toBe(3);

    const titles = Array.from(cards).map(
      (c) => (c as HTMLElement).querySelector('.basic-metrics__title')?.textContent?.trim(),
    );
    expect(titles).toEqual(['Your Goal', 'Level', 'Weight']);
  });

  it('should include an interactive TAP TO CHANGE helper text below each metric title', () => {
    const helpers = fixture.nativeElement.querySelectorAll('.basic-metrics__helper');
    expect(helpers.length).toBe(3);
    for (const helper of helpers) {
      expect((helper as HTMLElement).textContent?.trim()).toBe('TAP TO CHANGE');
    }
  });

  it('should display the current recorded values inside prominent buttons with refresh icons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.basic-metrics__btn');
    expect(buttons.length).toBe(3);

    expect(buttons[0].textContent).toContain('Lose Weight');
    expect(buttons[1].textContent).toContain('Beginner');
    expect(buttons[2].textContent).toContain('90 Kg');

    for (const btn of buttons) {
      expect((btn as HTMLElement).querySelector('svg')).toBeTruthy();
    }
  });

  it('should open Goal edit modal when clicking TAP TO CHANGE or the Goal button', () => {
    expect(component.activeModal()).toBeNull();
    component.openModal('goal');
    fixture.detectChanges();

    expect(component.activeModal()).toBe('goal');
    const modalTitle = fixture.nativeElement.querySelector('.basic-metrics__modal-title');
    expect(modalTitle).toBeTruthy();
    expect(modalTitle.textContent).toContain('What Is Your Goal ?');
  });

  it('should call accountService.editProfile and close modal upon saving', () => {
    component.openModal('goal');
    component.tempGoal.set('Gain Weight');
    fixture.detectChanges();

    component.saveMetric();
    expect(mockAccountService.editProfile).toHaveBeenCalledWith({ goal: 'Gain Weight' });
    expect(component.activeModal()).toBeNull();
  });
});
