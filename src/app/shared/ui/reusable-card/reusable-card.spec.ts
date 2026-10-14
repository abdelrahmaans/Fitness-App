import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslationService } from '../../../core/services/translation.service';
import { ReusableCard } from './reusable-card';

describe('ReusableCard', () => {
  let fixture: ComponentFixture<ReusableCard>;
  let component: ReusableCard;

  const translationServiceMock = {
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'SAMPLE_TITLE': 'Sample Title',
        'REUSABLE_CARD.READ_MORE': 'Read More',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ReusableCard],
      providers: [
        provideRouter([]),
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReusableCard);
    component = fixture.componentInstance;
  });

  it('should create ReusableCard component', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render image with src and alt attributes', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.componentRef.setInput('alt', 'Custom Alt Text');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.reusable-card__image') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('images/healthy-1.webp');
    expect(img.getAttribute('alt')).toBe('Custom Alt Text');
  });

  it('should fallback to translated title if alt is not provided', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('.reusable-card__image') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('Sample Title');
  });

  it('should render translated title and default Read More CTA label', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.reusable-card__title');
    const ctaLabelEl = fixture.nativeElement.querySelector('.reusable-card__cta-label');

    expect(titleEl.textContent.trim()).toBe('Sample Title');
    expect(ctaLabelEl.textContent.trim()).toBe('Read More');
  });

  it('should emit cardClick output when card is clicked', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.detectChanges();

    const spy = vi.fn();
    component.cardClick.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.reusable-card') as HTMLElement;
    card.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit cardClick output when Enter or Space is pressed', () => {
    fixture.componentRef.setInput('title', 'SAMPLE_TITLE');
    fixture.componentRef.setInput('image', 'images/healthy-1.webp');
    fixture.detectChanges();

    const spy = vi.fn();
    component.cardClick.subscribe(spy);

    const card = fixture.nativeElement.querySelector('.reusable-card') as HTMLElement;
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
