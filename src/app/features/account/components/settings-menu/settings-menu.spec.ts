import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AccountService } from '../../services/account.service';
import { SettingsMenu } from './settings-menu';

describe('SettingsMenu Component', () => {
  let component: SettingsMenu;
  let fixture: ComponentFixture<SettingsMenu>;

  const mockIsDark = signal(true);
  const mockCurrentLang = signal<'en' | 'ar'>('en');

  const mockThemeService = {
    isDark: mockIsDark,
    currentTheme: signal('dark'),
    toggleTheme: vi.fn(() => {
      mockIsDark.set(!mockIsDark());
    }),
    setTheme: vi.fn(),
  };

  const mockTranslationService = {
    currentLang: mockCurrentLang,
    direction: signal('ltr'),
    isLoading: signal(false),
    translate: vi.fn((key: string) => key),
    toggleLanguage: vi.fn(() => {
      mockCurrentLang.set(mockCurrentLang() === 'en' ? 'ar' : 'en');
      return of({});
    }),
    setLanguage: vi.fn((lang: 'en' | 'ar') => {
      mockCurrentLang.set(lang);
      return of({});
    }),
  };

  const mockAuthService = {
    logout: vi.fn(),
    getToken: vi.fn(() => 'mock-token'),
    getUser: vi.fn(() => null),
  };

  const mockAccountService = {
    isUpdating: signal(false),
    changePassword: vi.fn(() => of({ message: 'success', token: 'new-token' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsDark.set(true);
    mockCurrentLang.set('en');

    await TestBed.configureTestingModule({
      imports: [SettingsMenu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AccountService, useValue: mockAccountService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the SettingsMenu component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 7 interactive settings cards in the grid', () => {
    const cards = fixture.nativeElement.querySelectorAll('.settings-card');
    expect(cards.length).toBe(7);
  });

  it('should render Change Password card and open modal on click', () => {
    const card = fixture.nativeElement.querySelector('#settings-card-change-password');
    expect(card).toBeTruthy();

    card.click();
    fixture.detectChanges();

    expect(component.activeModal()).toBe('change-password');
    const modal = fixture.nativeElement.querySelector('.settings-modal-content');
    expect(modal).toBeTruthy();
  });

  it('should render Mood card and call toggleTheme on click', () => {
    const card = fixture.nativeElement.querySelector('#settings-card-mood');
    expect(card).toBeTruthy();

    card.click();
    fixture.detectChanges();

    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should render dedicated Logout card with distinct styling and open logout modal on click', () => {
    const logoutCard = fixture.nativeElement.querySelector('#settings-card-logout');
    expect(logoutCard).toBeTruthy();
    expect(logoutCard.classList.contains('settings-card--logout')).toBe(true);

    logoutCard.click();
    fixture.detectChanges();

    expect(component.activeModal()).toBe('logout');

    const confirmBtn = fixture.nativeElement.querySelector('#settings-confirm-logout-btn');
    expect(confirmBtn).toBeTruthy();

    confirmBtn.click();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.activeModal()).toBeNull();
  });

  it('should validate and call accountService.changePassword upon valid submission', () => {
    component.openModal('change-password');
    fixture.detectChanges();

    component.changePasswordForm.setValue({
      password: 'CurrentPass123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });

    component.submitChangePassword();

    expect(mockAccountService.changePassword).toHaveBeenCalledWith({
      password: 'CurrentPass123!',
      newPassword: 'NewPassword123!',
    });
    expect(component.passwordSuccess()).toBe(true);
  });
});
