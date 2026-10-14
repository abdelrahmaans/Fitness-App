import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { AuthLink } from './auth-link';

@Component({
  template: `
    <app-auth-link>
      <span text>Lead </span>
      <a link routerLink="/auth/register">Register</a>
    </app-auth-link>
  `,
  imports: [AuthLink, RouterLink],
})
class AuthLinkHost {}

describe('AuthLink', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLink, AuthLinkHost],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthLink);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('projects text and link content', () => {
    const fixture = TestBed.createComponent(AuthLinkHost);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.auth-link') as HTMLElement;
    expect(el.textContent).toContain('Lead');
    expect(el.textContent).toContain('Register');
    expect(el.querySelector('a')?.getAttribute('href')).toContain('/auth/register');
  });

  it('applies customClass', () => {
    const fixture = TestBed.createComponent(AuthLink);
    fixture.componentRef.setInput('customClass', 'text-end');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.auth-link')?.classList.contains('text-end')).toBe(true);
  });
});
