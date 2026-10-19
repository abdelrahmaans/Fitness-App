import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private readonly themeSignal = signal<AppTheme>(this.resolveInitialTheme());

  /** Read-only signal of active theme */
  readonly currentTheme = this.themeSignal.asReadonly();

  /** Boolean signal indicating if active theme is dark */
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  /**
   * Toggles theme between 'light' and 'dark'
   */
  toggleTheme(): void {
    const nextTheme: AppTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Explicitly sets the theme
   */
  setTheme(theme: AppTheme): void {
    if (this.themeSignal() !== theme) {
      this.themeSignal.set(theme);
      this.applyTheme(theme);
      this.persistTheme(theme);
    }
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
        // Ignore storage write error
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
