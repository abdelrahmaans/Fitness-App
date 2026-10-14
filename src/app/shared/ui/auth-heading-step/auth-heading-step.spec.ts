import { TestBed } from '@angular/core/testing';
import { resolveAuthHeadingStep } from '../../utils/auth-heading-step';
import { AuthHeadingStep } from './auth-heading-step';

describe('AuthHeadingStep', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthHeadingStep],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthHeadingStep);
    fixture.componentRef.setInput('progress', resolveAuthHeadingStep('2/6'));
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders step label text with correct class', () => {
    const fixture = TestBed.createComponent(AuthHeadingStep);
    fixture.componentRef.setInput('progress', resolveAuthHeadingStep('2/6'));
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.auth-heading__step-label');
    expect(label).toBeTruthy();
    expect(label.textContent?.trim()).toBe('2/6');
  });
});
