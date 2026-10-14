import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the login form with shared auth UI', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-auth-heading')).toBeTruthy();
    expect(el.querySelector('.login__title')?.textContent?.trim()).toBe('Login');
    expect(el.querySelectorAll('app-auth-input').length).toBe(2);
    expect(el.querySelector('app-auth-button')).toBeTruthy();
  });
});
