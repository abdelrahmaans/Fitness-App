import { TestBed } from '@angular/core/testing';
import { RegisterAge } from './age';

describe('RegisterAge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RegisterAge] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterAge);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the age onboarding copy and number picker', () => {
    const fixture = TestBed.createComponent(RegisterAge);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-auth-heading')).toBeTruthy();
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('How Old Are You ?');
    const picker = el.querySelector('app-auth-number-picker') as HTMLElement;
    expect(picker).toBeTruthy();
    expect(picker.querySelector('.auth-number-picker__unit')?.textContent?.trim()).toBe('Yr');
    expect(el.querySelector('app-auth-button')).toBeTruthy();
  });
});
