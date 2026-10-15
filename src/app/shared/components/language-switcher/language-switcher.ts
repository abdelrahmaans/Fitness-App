import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { SupportedLanguage } from '../../../core/models/translation.models';
import { ThemeService, type AppTheme } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';

export type { AppTheme };

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  private readonly translationService = inject(TranslationService);
  private readonly themeService = inject(ThemeService);

  /** Active language signal ('en' | 'ar') */
  readonly currentLang = this.translationService.currentLang;

  /** Active direction signal ('ltr' | 'rtl') */
  readonly direction = this.translationService.direction;

  /** True if translation file is currently loading */
  readonly isLoading = this.translationService.isLoading;

  /** Active theme signal ('light' | 'dark') */
  readonly currentTheme = this.themeService.currentTheme;

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
    this.themeService.setTheme(theme);
  }

  /** Toggles between 'light' and 'dark' */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

