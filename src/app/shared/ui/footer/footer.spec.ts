import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders brand, contact, hours, and location', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img[alt="Super Fitness"]')).toBeTruthy();
    expect(el.querySelector('footer')).toBeTruthy();
    expect(el.textContent).toContain('+91 123 456 789');
  });
});
