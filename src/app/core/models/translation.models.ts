export type SupportedLanguage = 'en' | 'ar';

export type TextDirection = 'ltr' | 'rtl';

export type TranslationDictionary = Record<string, string>;

export interface LanguageOption {
  readonly code: SupportedLanguage;
  readonly label: string;
  readonly nativeLabel: string;
  readonly direction: TextDirection;
}
