import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterForm } from './register-form';

describe('RegisterForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterForm);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the register form with shared auth UI and next button', () => {
    const fixture = TestBed.createComponent(RegisterForm);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-auth-heading')).toBeTruthy();
    expect(el.querySelector('.register-form__title')?.textContent?.trim()).toBe('Register');
    expect(el.querySelectorAll('app-auth-input').length).toBe(5);
    expect(el.querySelector('app-auth-button')).toBeTruthy();
  });
});
