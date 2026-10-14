import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_DIRECTIONS,
  STORAGE_LANGUAGE_KEY,
  TRANSLATION_ASSET_BASE_PATH,
} from '../constants/translation.constants';
import type {
  SupportedLanguage,
  TextDirection,
  TranslationDictionary,
} from '../models/translation.models';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  // -------------------------------------------------------------
  // Reactive Signals State
  // -------------------------------------------------------------
  private readonly activeLangSignal = signal<SupportedLanguage>(this.resolveInitialLanguage());
  private readonly translationsMapSignal = signal<Map<SupportedLanguage, TranslationDictionary>>(
    new Map(),
  );
  private readonly isLoadingSignal = signal<boolean>(false);

  /** Readonly signal holding the currently active language code ('en' | 'ar') */
  readonly currentLang = this.activeLangSignal.asReadonly();

  /** Computed signal providing current text direction ('ltr' | 'rtl') */
  readonly direction = computed<TextDirection>(() => LANGUAGE_DIRECTIONS[this.currentLang()]);

  /** Computed signal indicating whether the current language is Arabic */
  readonly isArabic = computed<boolean>(() => this.currentLang() === 'ar');

  /** Readonly signal indicating if a translation file is currently being fetched */
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /** Computed dictionary of currently active translations */
  readonly activeTranslations = computed<TranslationDictionary>(() => {
    return this.translationsMapSignal().get(this.currentLang()) ?? {};
  });

  // -------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------

  /**
   * Initializes language on application startup.
   * Reads persisted language or defaults to English, updates document attributes,
   * and loads the corresponding translation JSON file.
   */
  initLanguage(): Observable<TranslationDictionary> {
    const initialLang = this.resolveInitialLanguage();
    this.updateDocumentAttributes(initialLang, LANGUAGE_DIRECTIONS[initialLang]);
    return this.loadLanguage(initialLang);
  }

  /**
   * Switches the active language, updates storage & document attributes,
   * and loads the translation file if not already cached.
   */
  setLanguage(lang: SupportedLanguage): Observable<TranslationDictionary> {
    const cached = this.translationsMapSignal().get(lang);

    this.activeLangSignal.set(lang);
    this.persistLanguage(lang);
    this.updateDocumentAttributes(lang, LANGUAGE_DIRECTIONS[lang]);

    if (cached) {
      return of(cached);
    }

    return this.loadLanguage(lang);
  }

  /**
   * Toggles between English and Arabic.
   */
  toggleLanguage(): Observable<TranslationDictionary> {
    const nextLang: SupportedLanguage = this.currentLang() === 'en' ? 'ar' : 'en';
    return this.setLanguage(nextLang);
  }

  /**
   * Translates a given key with optional placeholder replacements.
   * Example: translate('AUTH.WELCOME', { name: 'Alex' })
   * Fallback: returns the key itself if not found.
   */
  translate(key: string, params?: Record<string, string | number>): string {
    if (!key) {
      return '';
    }

    const dictionary = this.activeTranslations();
    const rawValue = dictionary[key] ?? key;

    if (!params) {
      return rawValue;
    }

    return this.interpolate(rawValue, params);
  }

  /**
   * Synchronous check for an active translation key existence.
   */
  hasKey(key: string): boolean {
    return key in this.activeTranslations();
  }

  // -------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------

  private loadLanguage(lang: SupportedLanguage): Observable<TranslationDictionary> {
    this.isLoadingSignal.set(true);
    const assetUrl = `${TRANSLATION_ASSET_BASE_PATH}/${lang}.json`;

    return this.http.get<Record<string, unknown>>(assetUrl).pipe(
      map((rawJson) => this.flattenTranslations(rawJson)),
      tap((flattened) => {
        this.cacheTranslations(lang, flattened);
        this.isLoadingSignal.set(false);
      }),
      catchError(() => {
        this.isLoadingSignal.set(false);
        const fallback = this.translationsMapSignal().get(lang) ?? {};
        return of(fallback);
      }),
    );
  }

  private cacheTranslations(lang: SupportedLanguage, dictionary: TranslationDictionary): void {
    const updatedMap = new Map(this.translationsMapSignal());
    updatedMap.set(lang, dictionary);
    this.translationsMapSignal.set(updatedMap);
  }

  private resolveInitialLanguage(): SupportedLanguage {
    if (!isPlatformBrowser(this.platformId)) {
      return DEFAULT_LANGUAGE;
    }

    try {
      const stored = localStorage.getItem(STORAGE_LANGUAGE_KEY);
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
    } catch {
      // In private browsing or restricted environments, fallback to default
    }

    return DEFAULT_LANGUAGE;
  }

  private persistLanguage(lang: SupportedLanguage): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_LANGUAGE_KEY, lang);
    } catch {
      // Ignore storage write errors (e.g. quota exceeded or storage disabled)
    }
  }

  private updateDocumentAttributes(lang: SupportedLanguage, dir: TextDirection): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = this.document.documentElement;
    if (htmlElement) {
      htmlElement.setAttribute('lang', lang);
      htmlElement.setAttribute('dir', dir);
    }
  }

  /**
   * Recursively flattens nested JSON object into dot-notated dictionary.
   * e.g. { AUTH: { LOGIN: "Login" } } => { "AUTH.LOGIN": "Login" }
   */
  private flattenTranslations(
    source: Record<string, unknown>,
    prefix = '',
  ): TranslationDictionary {
    const output: TranslationDictionary = {};

    for (const [key, value] of Object.entries(source)) {
      const compositeKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        output[compositeKey] = value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedFlattened = this.flattenTranslations(
          value as Record<string, unknown>,
          compositeKey,
        );
        Object.assign(output, nestedFlattened);
      }
    }

    return output;
  }

  /**
   * Replaces placeholders like {{name}} or {{ name }} with provided param values.
   */
  private interpolate(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, paramName: string) => {
      const replacement = params[paramName];
      return replacement !== undefined ? String(replacement) : match;
    });
  }
}
