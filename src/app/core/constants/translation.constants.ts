import type { LanguageOption, SupportedLanguage, TextDirection } from '../models/translation.models';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const STORAGE_LANGUAGE_KEY = 'super_fitness_lang';

export const TRANSLATION_ASSET_BASE_PATH = '/in18';

export const LANGUAGE_DIRECTIONS: Readonly<Record<SupportedLanguage, TextDirection>> = {
  en: 'ltr',
  ar: 'rtl',
};

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr',
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    direction: 'rtl',
  },
] as const;
