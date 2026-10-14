import { TestBed } from '@angular/core/testing';
import { AuthSocialMediaIcons } from './auth-social-media-icons';

describe('AuthSocialMediaIcons', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSocialMediaIcons],
    }).compileComponents();
  });

  it('renders three provider icons with ink circles', () => {
    const fixture = TestBed.createComponent(AuthSocialMediaIcons);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '.auth-social-media-icons__item',
    ) as NodeListOf<HTMLElement>;

    expect(items.length).toBe(3);
    items.forEach((item) => {
      expect(item.classList.contains('size-8')).toBe(true);
      expect(item.classList.contains('bg-ink')).toBe(true);
      expect(item.querySelector('fa-icon.auth-social-media-icons__icon')).toBeTruthy();
    });

    expect(items[0].getAttribute('aria-label')).toBe('Facebook');
    expect(items[1].getAttribute('aria-label')).toBe('Google');
    expect(items[2].getAttribute('aria-label')).toBe('Apple');
  });
});
