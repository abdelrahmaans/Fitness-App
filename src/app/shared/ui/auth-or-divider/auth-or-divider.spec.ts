import { TestBed } from '@angular/core/testing';
import { AuthOrDivider } from './auth-or-divider';

describe('AuthOrDivider', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthOrDivider],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthOrDivider);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the default Or label and two lines', () => {
    const fixture = TestBed.createComponent(AuthOrDivider);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.auth-or-divider__label')?.textContent?.trim()).toBe('Or');
    expect(el.querySelectorAll('.auth-or-divider__line').length).toBe(2);
    expect(el.querySelector('.auth-or-divider')?.getAttribute('aria-label')).toBe('Or');
  });

  it('accepts a custom label', () => {
    const fixture = TestBed.createComponent(AuthOrDivider);
    fixture.componentRef.setInput('label', 'or');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-or-divider__label')?.textContent?.trim()).toBe('or');
  });
});
