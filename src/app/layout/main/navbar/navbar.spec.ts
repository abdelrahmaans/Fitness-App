import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let component: Navbar;

  const isAuthenticatedSignal = signal(false);
  const currentUserSignal = signal<{ _id?: string; email?: string } | null>(null);

  const authServiceMock = {
    isAuthenticated: isAuthenticatedSignal,
    currentUser: currentUserSignal,
    logout: vi.fn(),
  };

  const translationServiceMock = {
    currentLang: signal('en'),
    direction: signal('ltr'),
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'NAV.HOME': 'Home',
        'NAV.ABOUT': 'About',
        'NAV.CLASSES': 'Classes',
        'NAV.HEALTHY': 'Healthy',
        'NAV.LOGIN': 'LOGIN',
        'NAV.SIGN_UP': 'SIGN UP',
        'NAV.LOGOUT': 'Logout',
        'NAV.PROFILE': 'Profile',
        'NAV.LOGO_ALT': 'Super Fitness Logo',
        'NAV.TOGGLE_MENU': 'Toggle Navigation Menu',
        'NAV.USER_MENU': 'User Menu',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    isAuthenticatedSignal.set(false);
    currentUserSignal.set(null);
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the brand logo', () => {
    const logoImg = fixture.nativeElement.querySelector('.navbar__logo img') as HTMLImageElement;
    expect(logoImg).toBeTruthy();
    expect(logoImg.getAttribute('src')).toContain('assets/images/logo/logo.webp');
  });

  it('should render all navigation links', () => {
    const links = fixture.nativeElement.querySelectorAll('.navbar__links .navbar__link');
    expect(links.length).toBe(4);
    const linkTexts = Array.from(links).map((l) => (l as HTMLElement).textContent?.trim());
    expect(linkTexts).toEqual(['Home', 'About', 'Classes', 'Healthy']);
  });

  describe('Unauthenticated Guest State', () => {
    it('should display LOGIN and SIGN UP buttons with directional arrows when not logged in', () => {
      const loginBtn = fixture.nativeElement.querySelector('.navbar__btn--login') as HTMLAnchorElement;
      const signupBtn = fixture.nativeElement.querySelector('.navbar__btn--signup') as HTMLAnchorElement;
      const avatarBtn = fixture.nativeElement.querySelector('.navbar__avatar');

      expect(loginBtn).toBeTruthy();
      expect(loginBtn.textContent).toContain('LOGIN');
      expect(loginBtn.querySelector('.navbar__btn-arrow img')).toBeTruthy();

      expect(signupBtn).toBeTruthy();
      expect(signupBtn.textContent).toContain('SIGN UP');
      expect(signupBtn.querySelector('.navbar__btn-arrow img')).toBeTruthy();

      expect(avatarBtn).toBeNull();
    });
  });

  describe('Authenticated State', () => {
    beforeEach(() => {
      isAuthenticatedSignal.set(true);
      currentUserSignal.set({ email: 'athlete@superfitness.com' });
      fixture.detectChanges();
    });

    it('should display circular profile avatar icon and hide guest buttons', () => {
      const avatarBtn = fixture.nativeElement.querySelector('.navbar__avatar') as HTMLButtonElement;
      const loginBtn = fixture.nativeElement.querySelector('.navbar__btn--login');
      const signupBtn = fixture.nativeElement.querySelector('.navbar__btn--signup');

      expect(avatarBtn).toBeTruthy();
      expect(avatarBtn.classList.contains('rounded-full')).toBe(true);
      expect(avatarBtn.querySelector('svg')).toBeTruthy();

      expect(loginBtn).toBeNull();
      expect(signupBtn).toBeNull();
    });

    it('should toggle dropdown menu when avatar button is clicked', () => {
      const avatarBtn = fixture.nativeElement.querySelector('.navbar__avatar') as HTMLButtonElement;

      expect(component.isUserMenuOpen()).toBe(false);
      expect(fixture.nativeElement.querySelector('.navbar__dropdown')).toBeNull();

      avatarBtn.click();
      fixture.detectChanges();

      expect(component.isUserMenuOpen()).toBe(true);
      const dropdown = fixture.nativeElement.querySelector('.navbar__dropdown');
      expect(dropdown).toBeTruthy();
      expect(dropdown.textContent).toContain('athlete@superfitness.com');

      avatarBtn.click();
      fixture.detectChanges();
      expect(component.isUserMenuOpen()).toBe(false);
    });

    it('should invoke authService.logout() when logout action is clicked', () => {
      component.toggleUserMenu();
      fixture.detectChanges();

      const logoutBtn = fixture.nativeElement.querySelector(
        '.navbar__dropdown button',
      ) as HTMLButtonElement;
      expect(logoutBtn).toBeTruthy();

      logoutBtn.click();
      expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
      expect(component.isUserMenuOpen()).toBe(false);
    });
  });

  describe('Mobile Menu Responsiveness', () => {
    it('should toggle mobile menu drawer', () => {
      const toggleBtn = fixture.nativeElement.querySelector('.navbar__toggle') as HTMLButtonElement;

      expect(component.isMobileMenuOpen()).toBe(false);
      expect(fixture.nativeElement.querySelector('.navbar__mobile-menu')).toBeNull();

      toggleBtn.click();
      fixture.detectChanges();

      expect(component.isMobileMenuOpen()).toBe(true);
      expect(fixture.nativeElement.querySelector('.navbar__mobile-menu')).toBeTruthy();

      toggleBtn.click();
      fixture.detectChanges();
      expect(component.isMobileMenuOpen()).toBe(false);
    });

    it('should close menus on Escape key press', () => {
      component.isMobileMenuOpen.set(true);
      component.isUserMenuOpen.set(true);

      component.onEscape();

      expect(component.isMobileMenuOpen()).toBe(false);
      expect(component.isUserMenuOpen()).toBe(false);
    });
  });

  describe('Scroll Behavior', () => {
    it('should update isScrolled when window scroll changes', () => {
      expect(component.isScrolled()).toBe(false);

      // Simulate scroll past 20px
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
      component.onWindowScroll();
      expect(component.isScrolled()).toBe(true);

      // Simulate scroll back to top
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      component.onWindowScroll();
      expect(component.isScrolled()).toBe(false);
    });
  });
});
