import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLogOut,
  LucideMenu,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { RightArrowIcon } from '../../../shared/ui/right-arrow-icon/right-arrow-icon';

export interface NavItem {
  labelKey: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LucideUser,
    RightArrowIcon,
    LucideMenu,
    LucideX,
    LucideLogOut,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Mobile navigation drawer open state */
  readonly isMobileMenuOpen = signal(false);

  /** Authenticated user avatar dropdown open state */
  readonly isUserMenuOpen = signal(false);

  /** Tracks whether window is scrolled past hero top threshold */
  readonly isScrolled = signal(false);

  /** Primary navigation routes */
  readonly navLinks: readonly NavItem[] = [
    { labelKey: 'NAV.HOME', path: '/home' },
    { labelKey: 'NAV.ABOUT', path: '/about' },
    { labelKey: 'NAV.CLASSES', path: '/classes' },
    { labelKey: 'NAV.HEALTHY', path: '/healthy' },
  ];

  ngOnInit(): void {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  /** Toggles mobile drawer */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
    if (this.isMobileMenuOpen()) {
      this.isUserMenuOpen.set(false);
    }
  }

  /** Closes mobile drawer */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /** Toggles authenticated profile menu */
  toggleUserMenu(): void {
    this.isUserMenuOpen.update((open) => !open);
  }

  /** Closes authenticated profile menu */
  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  /** Logs out user and closes menus */
  logout(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.authService.logout();
  }

  /** Close menus on outside click or escape key */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
  }
}
