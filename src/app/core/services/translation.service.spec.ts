import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { STORAGE_LANGUAGE_KEY } from '../constants/translation.constants';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;
  let doc: Document;

  const mockEnTranslations = {
    WELCOME: 'Welcome to Super Fitness',
    AUTH: {
      LOGIN: 'Login',
    },
    GREETING: 'Hello, {{name}}!',
  };

  const mockArTranslations = {
    WELCOME: 'مرحبًا بك في سوبر فيتنس',
    AUTH: {
      LOGIN: 'تسجيل الدخول',
    },
    GREETING: 'مرحبًا {{name}}!',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TranslationService],
    });

    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should default to "en" when localStorage is empty', () => {
    expect(service.currentLang()).toBe('en');
    expect(service.direction()).toBe('ltr');
    expect(service.isArabic()).toBe(false);
  });

  it('should read persisted language from localStorage if valid', () => {
    localStorage.setItem(STORAGE_LANGUAGE_KEY, 'ar');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TranslationService],
    });
    const arService = TestBed.inject(TranslationService);

    expect(arService.currentLang()).toBe('ar');
    expect(arService.direction()).toBe('rtl');
    expect(arService.isArabic()).toBe(true);
  });

  it('should load translation file via HttpClient and flatten keys', () => {
    service.initLanguage().subscribe((translations) => {
      expect(translations['WELCOME']).toBe('Welcome to Super Fitness');
      expect(translations['AUTH.LOGIN']).toBe('Login');
    });

    const req = httpMock.expectOne('/in18/en.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockEnTranslations);

    expect(service.translate('WELCOME')).toBe('Welcome to Super Fitness');
    expect(service.translate('AUTH.LOGIN')).toBe('Login');
    expect(service.translate('GREETING', { name: 'Sarah' })).toBe('Hello, Sarah!');
  });

  it('should return the key itself if not found in translations', () => {
    expect(service.translate('NON_EXISTENT_KEY')).toBe('NON_EXISTENT_KEY');
  });

  it('should update document lang and dir attributes on setLanguage', () => {
    service.setLanguage('ar').subscribe();

    const req = httpMock.expectOne('/in18/ar.json');
    req.flush(mockArTranslations);

    expect(service.currentLang()).toBe('ar');
    expect(service.direction()).toBe('rtl');
    expect(doc.documentElement.getAttribute('lang')).toBe('ar');
    expect(doc.documentElement.getAttribute('dir')).toBe('rtl');
    expect(localStorage.getItem(STORAGE_LANGUAGE_KEY)).toBe('ar');
  });

  it('should toggle language between "en" and "ar"', () => {
    // 1. Initialize with 'en' and flush cache
    service.initLanguage().subscribe();
    const reqEn = httpMock.expectOne('/in18/en.json');
    reqEn.flush(mockEnTranslations);
    expect(service.currentLang()).toBe('en');

    // 2. Toggle to 'ar'
    service.toggleLanguage().subscribe();
    const reqAr = httpMock.expectOne('/in18/ar.json');
    reqAr.flush(mockArTranslations);
    expect(service.currentLang()).toBe('ar');

    // 3. Toggle back to 'en' (already cached, no new HTTP request needed)
    service.toggleLanguage().subscribe();
    expect(service.currentLang()).toBe('en');
  });

  it('should handle HTTP error gracefully when loading translation file', () => {
    service.setLanguage('ar').subscribe((translations) => {
      expect(translations).toEqual({});
      expect(service.isLoading()).toBe(false);
    });

    const req = httpMock.expectOne('/in18/ar.json');
    req.error(new ProgressEvent('Network error'));
  });
});
