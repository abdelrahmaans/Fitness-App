import { TestBed } from '@angular/core/testing';
import { AuthError } from './auth-error';

describe('AuthError', () => {
  it('renders the message', async () => {
    await TestBed.configureTestingModule({ imports: [AuthError] }).compileComponents();

    const fixture = TestBed.createComponent(AuthError);
    fixture.componentRef.setInput('message', 'Email is required');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-error')?.textContent?.trim()).toBe('Email is required');
  });
});
