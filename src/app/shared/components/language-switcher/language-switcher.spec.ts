import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupportedLanguage, TextDirection } from '../../../core/models/translation.models';
import { TranslationService } from '../../../core/services/translation.service';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  let fixture: ComponentFixture<LanguageSwitcher>;
  let component: LanguageSwitcher;

  const currentLangSignal = signal<SupportedLanguage>('en');
  const directionSignal = signal<TextDirection>('ltr');
  const isLoadingSignal = signal<boolean>(false);

  let translationServiceMock: {
    currentLang: typeof currentLangSignal;
    direction: typeof directionSignal;
    isLoading: typeof isLoadingSignal;
    setLanguage: ReturnType<typeof vi.fn>;
    toggleLanguage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.clear();
    currentLangSignal.set('en');
    directionSignal.set('ltr');
    isLoadingSignal.set(false);

    translationServiceMock = {
      currentLang: currentLangSignal,
      direction: directionSignal,
      isLoading: isLoadingSignal,
      setLanguage: vi.fn().mockReturnValue(of({})),
      toggleLanguage: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [LanguageSwitcher],
      providers: [{ provide: TranslationService, useValue: translationServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the LanguageSwitcher component', () => {
    expect(component).toBeTruthy();
  });

  it('should render a single language toggle button that triggers toggleLanguage on click', () => {
    const langButton = fixture.nativeElement.querySelector('[data-test="toggle-lang"]') as HTMLButtonElement;
    expect(langButton).toBeTruthy();
    expect(langButton.textContent?.trim()).toBe('AR');

    langButton.click();
    expect(translationServiceMock.toggleLanguage).toHaveBeenCalledTimes(1);
  });

  it('should update language toggle button label when language changes', () => {
    currentLangSignal.set('ar');
    fixture.detectChanges();

    const langButton = fixture.nativeElement.querySelector('[data-test="toggle-lang"]') as HTMLButtonElement;
    expect(langButton.textContent?.trim()).toBe('EN');
  });

  it('should render a single theme toggle button and toggle between dark and light on click', () => {
    const themeButton = fixture.nativeElement.querySelector('[data-test="toggle-theme"]') as HTMLButtonElement;
    expect(themeButton).toBeTruthy();
    expect(component.currentTheme()).toBe('dark');

    // Click to switch to light
    themeButton.click();
    fixture.detectChanges();

    expect(component.currentTheme()).toBe('light');

    // Click to switch back to dark
    themeButton.click();
    fixture.detectChanges();

    expect(component.currentTheme()).toBe('dark');
  });
});
