import { TestBed } from '@angular/core/testing';
import { TranslationService } from '../../../core/services/translation.service';
import { SectionTitle } from './section-title';

describe('SectionTitle', () => {
  const translations: Record<string, string> = {
    'SECTION_TITLE.HEALTHY.WATERMARK': 'HEALTHY',
    'SECTION_TITLE.HEALTHY.LABEL': 'Healthy Nutritions',
    'SECTION_TITLE.WHY_US.WATERMARK': 'WHY US',
    'SECTION_TITLE.WHY_US.LABEL': 'Why Us',
    'SECTION_TITLE.WORKOUTS.WATERMARK': 'WORKOUTS',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTitle],
      providers: [
        {
          provide: TranslationService,
          useValue: {
            translate: (key: string) => translations[key] ?? key,
          },
        },
      ],
    }).compileComponents();
  });

  it('renders watermark and label (start alignment)', () => {
    const fixture = TestBed.createComponent(SectionTitle);
    fixture.componentRef.setInput('backgroundTitleKey', 'SECTION_TITLE.HEALTHY.WATERMARK');
    fixture.componentRef.setInput('labelKey', 'SECTION_TITLE.HEALTHY.LABEL');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const header = el.querySelector('header');
    const watermark = header?.querySelector('h3');
    expect(header?.querySelector('.inline-grid')).toBeTruthy();
    expect(watermark?.textContent?.trim()).toBe('HEALTHY');
    expect(watermark?.classList.contains('max-md:hidden')).toBe(true);
    expect(el.textContent).toContain('Healthy Nutritions');
  });

  it('renders watermark only when labelKey is omitted', () => {
    const fixture = TestBed.createComponent(SectionTitle);
    fixture.componentRef.setInput('backgroundTitleKey', 'SECTION_TITLE.WORKOUTS.WATERMARK');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const watermark = el.querySelector('h3');
    expect(watermark?.textContent?.trim()).toBe('WORKOUTS');
    expect(watermark?.classList.contains('max-md:hidden')).toBe(false);
    expect(watermark?.getAttribute('aria-hidden')).toBeNull();
    expect(el.querySelector('p')).toBeNull();
  });

  it('applies center alignment', () => {
    const fixture = TestBed.createComponent(SectionTitle);
    fixture.componentRef.setInput('backgroundTitleKey', 'SECTION_TITLE.WHY_US.WATERMARK');
    fixture.componentRef.setInput('labelKey', 'SECTION_TITLE.WHY_US.LABEL');
    fixture.componentRef.setInput('align', 'center');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const header = el.querySelector('header');
    expect(header?.classList.contains('justify-center')).toBe(true);
    expect(header?.querySelector('.w-full')).toBeTruthy();
  });
});
