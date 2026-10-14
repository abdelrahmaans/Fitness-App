import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import type { SupportedLanguage } from '../../../core/models/translation.models';
import { TranslationService } from '../../../core/services/translation.service';

export type AppTheme = 'light' | 'dark';

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private readonly translationService = inject(TranslationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  /** Active language signal ('en' | 'ar') */
  readonly currentLang = this.translationService.currentLang;

  /** Active direction signal ('ltr' | 'rtl') */
  readonly direction = this.translationService.direction;

  /** True if translation file is currently loading */
  readonly isLoading = this.translationService.isLoading;

  /** Active theme signal ('light' | 'dark') - defaults to 'dark' matching the brand aesthetic */
  readonly currentTheme = signal<AppTheme>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  /** Selects a specific language */
  selectLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() !== lang) {
      this.translationService.setLanguage(lang).subscribe();
    }
  }

  /** Toggles between 'en' and 'ar' */
  toggleLanguage(): void {
    this.translationService.toggleLanguage().subscribe();
  }

  /** Selects a specific theme */
  selectTheme(theme: AppTheme): void {
    if (this.currentTheme() !== theme) {
      this.currentTheme.set(theme);
      this.applyTheme(theme);
      this.persistTheme(theme);
    }
  }

  /** Toggles between 'light' and 'dark' */
  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.selectTheme(nextTheme);
  }

  private resolveInitialTheme(): AppTheme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'dark';
    }
    try {
      const stored = localStorage.getItem('app_theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Fallback to dark
    }
    return 'dark';
  }

  private persistTheme(theme: AppTheme): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('app_theme', theme);
      } catch {
        // Ignore storage write issues
      }
    }
  }

  private applyTheme(theme: AppTheme): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = this.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }
}
