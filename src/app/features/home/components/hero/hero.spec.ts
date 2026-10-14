import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslationService } from '../../../../core/services/translation.service';
import { Hero } from './hero';

describe('Hero', () => {
  let fixture: ComponentFixture<Hero>;
  let component: Hero;

  const translationServiceMock = {
    currentLang: signal('en'),
    direction: signal('ltr'),
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'HERO.TITLE_PART1': 'YOUR BODY CAN',
        'HERO.STAND': 'STAND',
        'HERO.ALMOST': 'ALMOST',
        'HERO.TITLE_PART2': 'ANYTHING',
        'HERO.SUBTEXT':
          "It's your mind that needs convincing. Push past your limits, stay committed, and watch as your body transform into powerhouse of strength and resilience. Start your journey today & truly capable of!",
        'HERO.MEMBERS_COUNT': '1200+',
        'HERO.MEMBERS_LABEL': 'Active Members',
        'HERO.TRAINERS_COUNT': '12+',
        'HERO.TRAINERS_LABEL': 'Certified Trainers',
        'HERO.EXPERIENCE_COUNT': '20+',
        'HERO.EXPERIENCE_LABEL': 'Year Of Experience',
        'HERO.GET_STARTED': 'Get Started',
        'HERO.EXPLORE_MORE': 'Explore More',
        'HERO.CHATBOT_BTN': 'Hey Ask Me',
        'HERO.TRAINER_ALT': 'Professional Fitness Trainer',
        'HERO.CHATBOT_ALT': 'Fitness AI Assistant Robot',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [
        provideRouter([]),
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Hero component', () => {
    expect(component).toBeTruthy();
  });

  it('should render prominent headline with orange highlighted words STAND and ALMOST', () => {
    const headline = fixture.nativeElement.querySelector('.hero__headline') as HTMLElement;
    expect(headline).toBeTruthy();

    const highlights = Array.from(headline.querySelectorAll('.hero__highlight'));
    expect(highlights.length).toBeGreaterThanOrEqual(2);
    const highlightTexts = highlights.map((h) => (h as HTMLElement).textContent?.trim()).join(' ');
    expect(highlightTexts).toContain('STAND');
    expect(highlightTexts).toContain('ALMOST');
    highlights.forEach((h) => expect((h as HTMLElement).classList.contains('text-orange-500')).toBe(true));
  });

  it('should render motivational subtext bordered by vertical orange line', () => {
    const subtextWrapper = fixture.nativeElement.querySelector('.hero__subtext-wrapper');
    expect(subtextWrapper).toBeTruthy();
    expect(subtextWrapper.classList.contains('border-s-4')).toBe(true);
    expect(subtextWrapper.classList.contains('border-orange-500')).toBe(true);

    const subtext = subtextWrapper.querySelector('.hero__subtext');
    expect(subtext).toBeTruthy();
    expect(subtext.textContent?.trim()).toContain("It's your mind that needs convincing");
  });

  it('should render three statistical figures', () => {
    const statItems = fixture.nativeElement.querySelectorAll('.hero__stat-item');
    expect(statItems.length).toBe(3);

    const statValues = Array.from(statItems).map((el) =>
      (el as HTMLElement).querySelector('.hero__stat-value')?.textContent?.trim(),
    );
    const statLabels = Array.from(statItems).map((el) =>
      (el as HTMLElement).querySelector('.hero__stat-label')?.textContent?.trim(),
    );

    expect(statValues).toEqual(['1200+', '12+', '20+']);
    expect(statLabels).toEqual(['Active Members', 'Certified Trainers', 'Year Of Experience']);
  });

  it('should render solid orange Get Started button and outlined Explore More button with directional arrows', () => {
    const primaryBtn = fixture.nativeElement.querySelector('.hero__btn--primary') as HTMLAnchorElement;
    const secondaryBtn = fixture.nativeElement.querySelector('.hero__btn--secondary') as HTMLAnchorElement;

    expect(primaryBtn).toBeTruthy();
    expect(primaryBtn.textContent).toContain('Get Started');
    expect(primaryBtn.classList.contains('bg-orange-500')).toBe(true);
    expect(primaryBtn.querySelector('.hero__btn-arrow img')).toBeTruthy();

    expect(secondaryBtn).toBeTruthy();
    expect(secondaryBtn.textContent).toContain('Explore More');
    expect(secondaryBtn.classList.contains('border-orange-500')).toBe(true);
    expect(secondaryBtn.querySelector('.hero__btn-arrow img')).toBeTruthy();
  });

  it('should render trainer image on the right', () => {
    const trainerImg = fixture.nativeElement.querySelector('.hero__trainer-img') as HTMLImageElement;
    expect(trainerImg).toBeTruthy();
    expect(trainerImg.getAttribute('src')).toContain('images/hero.webp');
  });
});
