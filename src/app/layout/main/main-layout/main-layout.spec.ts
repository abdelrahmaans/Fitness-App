import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  const authServiceMock = {
    isAuthenticated: signal(false),
    currentUser: signal(null),
    logout: vi.fn(),
  };

  const translationServiceMock = {
    currentLang: signal('en'),
    direction: signal('ltr'),
    translate: vi.fn((key: string) => key),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the navbar, bottom marquee, and footer on every main page', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-navbar')).toBeTruthy();
    expect(root.querySelector('app-marquee-banner')).toBeTruthy();
    expect(root.querySelector('app-footer')).toBeTruthy();
  });
});
