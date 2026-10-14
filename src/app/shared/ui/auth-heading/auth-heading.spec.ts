import { TestBed } from '@angular/core/testing';
import { AuthHeading } from './auth-heading';

describe('AuthHeading', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthHeading],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('headline', 'Forget Password');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders headline only (forgot password)', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('headline', 'Forget Password');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-heading__headline')?.textContent?.trim()).toBe('Forget Password');
    expect(el.querySelector('.auth-heading__lead')).toBeNull();
    expect(el.querySelector('.auth-heading__step')).toBeNull();
    expect(el.querySelector('.auth-heading__support')).toBeNull();
  });

  it('renders lead then headline (login / register)', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('lead', 'Hey There');
    fixture.componentRef.setInput('headline', 'Create An Account');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-heading__lead')?.textContent?.trim()).toBe('Hey There');
    expect(el.querySelector('.auth-heading__headline')?.textContent?.trim()).toBe('Create An Account');
  });

  it('renders step, headline, and support (onboarding)', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('step', '2/6');
    fixture.componentRef.setInput('headline', 'How Old Are You ?');
    fixture.componentRef.setInput('support', 'This Helps Us Create Your Personalized Plan');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-heading__step-label')?.textContent?.trim()).toBe('2/6');
    expect(el.querySelector('.auth-heading__step')?.getAttribute('aria-label')).toBe('Step 2 of 6');
    expect(el.querySelector('.auth-heading__step-ring')).toBeTruthy();
    expect(el.querySelector('.auth-heading__headline')?.textContent?.trim()).toBe('How Old Are You ?');
    expect(el.querySelector('.auth-heading__support')?.textContent?.trim()).toBe(
      'This Helps Us Create Your Personalized Plan',
    );
  });

  it('hides lead when step is provided', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('lead', 'Hey There');
    fixture.componentRef.setInput('step', '1/6');
    fixture.componentRef.setInput('headline', 'Tell Us About Yourself!');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.auth-heading__lead')).toBeNull();
    expect(el.querySelector('.auth-heading__step-label')?.textContent?.trim()).toBe('1/6');
    expect(el.querySelector('.auth-heading__step-ring')).toBeNull();
  });

  it('shows a full progress ring on the last step', () => {
    const fixture = TestBed.createComponent(AuthHeading);
    fixture.componentRef.setInput('step', '6/6');
    fixture.componentRef.setInput('headline', 'Your Regular Physical Activity Level ?');
    fixture.detectChanges();

    const ring = fixture.nativeElement.querySelector('.auth-heading__step-ring-stroke') as SVGCircleElement;
    expect(ring).toBeTruthy();
    const dash = ring.getAttribute('stroke-dasharray') ?? '';
    const [filled, total] = dash.split(' ').map(Number);
    expect(filled).toBeCloseTo(total, 0);
  });
});
