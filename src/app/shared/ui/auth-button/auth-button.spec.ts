import { TestBed } from '@angular/core/testing';
import { AuthButton } from './auth-button';

describe('AuthButton', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AuthButton] }).compileComponents();
  });

  it('renders register primary label', () => {
    const fixture = TestBed.createComponent(AuthButton);
    fixture.componentRef.setInput('kind', 'register');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Register');
    expect(btn.classList.contains('bg-orange-500')).toBe(true);
    expect(btn.disabled).toBe(false);
  });

  it('renders previous as secondary', () => {
    const fixture = TestBed.createComponent(AuthButton);
    fixture.componentRef.setInput('kind', 'previous');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.classList.contains('border-orange-500')).toBe(true);
    expect(btn.classList.contains('text-orange-500')).toBe(true);
  });

  it('emits clicked', () => {
    const fixture = TestBed.createComponent(AuthButton);
    fixture.componentRef.setInput('kind', 'next');
    fixture.detectChanges();

    let clicked = false;
    fixture.componentInstance.clicked.subscribe(() => (clicked = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(clicked).toBe(true);
  });
});
