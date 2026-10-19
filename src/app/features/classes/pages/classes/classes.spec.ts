import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslationService } from '../../../../core/services/translation.service';
import { WorkoutsService } from '../../../home/services/workouts.service';
import { Classes } from './classes';

describe('Classes', () => {
  let fixture: ComponentFixture<Classes>;
  let component: Classes;

  const mockMuscleGroups = [
    { _id: 'grp-1', name: 'Chest' },
    { _id: 'grp-2', name: 'Shoulders' },
  ];

  const workoutsServiceMock = {
    getMuscleGroups: vi.fn(() => of(mockMuscleGroups)),
    getRandomMuscles: vi.fn(() =>
      of([
        { _id: 'r1', name: 'Biceps Femoris', image: 'https://iili.io/33p7ww7.png' },
        { _id: 'r2', name: 'Rectus Abdominis', image: 'https://iili.io/33pYHNI.png' },
        { _id: 'r3', name: 'Posterior Deltoids', image: 'https://iili.io/33p7ene.png' },
        { _id: 'r4', name: 'Pectoralis Major', image: 'https://iili.io/33pYHNI.png' },
        { _id: 'r5', name: 'Latissimus Dorsi', image: 'https://iili.io/33pYHNI.png' },
        { _id: 'r6', name: 'Quadriceps', image: 'https://iili.io/33pYHNI.png' },
        { _id: 'r7', name: 'Hamstrings', image: 'https://iili.io/33pYHNI.png' },
      ]),
    ),
    getMusclesByGroupId: vi.fn(() =>
      of([{ _id: 'm1', name: 'Pectoralis Major', image: 'https://iili.io/33pYHNI.png' }]),
    ),
  };

  const translationServiceMock = {
    currentLang: signal('en'),
    direction: signal('ltr'),
    isLoading: signal(false),
    setLanguage: vi.fn(() => of({})),
    toggleLanguage: vi.fn(() => of({})),
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'SECTION_TITLE.WORKOUTS.WATERMARK': 'WORKOUTS',
        'SECTION_TITLE.WORKOUTS.LABEL': 'Fitness Class',
        'WORKOUTS.TITLE_MAIN': 'TRANSFORM YOUR BODY WITH OUR',
        'WORKOUTS.TITLE_DYNAMIC': 'DYNAMIC',
        'WORKOUTS.TITLE_HIGHLIGHT': 'UPCOMING WORKOUTS',
        'WORKOUTS.FILTER_FULL_BODY': 'Full Body',
        'WORKOUTS.EXPLORE': 'Explore',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Classes],
      providers: [
        provideRouter([]),
        { provide: WorkoutsService, useValue: workoutsServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Classes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the classes page', () => {
    expect(component).toBeTruthy();
  });

  it('should render the reusable header and headline', () => {
    const headline = fixture.nativeElement.querySelector('.classes__headline') as HTMLElement;
    expect(fixture.nativeElement.querySelector('app-section-title')).toBeTruthy();
    expect(headline.textContent).toContain('TRANSFORM YOUR BODY WITH OUR');
    expect(headline.querySelector('.text-orange-500')?.textContent?.trim()).toBe('UPCOMING WORKOUTS');
  });

  it('should render filter tabs from the muscles API with Full Body active', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.classes__filter-btn');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent.trim()).toBe('Full Body');
    expect(buttons[0].classList.contains('classes__filter-btn--active')).toBe(true);
    expect(buttons[1].textContent.trim()).toBe('Chest');
    expect(buttons[2].textContent.trim()).toBe('Shoulders');
    expect(workoutsServiceMock.getMuscleGroups).toHaveBeenCalled();
  });

  it('should load muscles for the selected group', () => {
    component.selectCategory('grp-1');
    fixture.detectChanges();

    expect(workoutsServiceMock.getMusclesByGroupId).toHaveBeenCalledWith('grp-1');
    expect(component.activeCategory()).toBe('grp-1');
    expect(component.items()[0].title).toBe('Pectoralis Major');
    expect(fixture.nativeElement.querySelectorAll('app-reusable-card').length).toBe(1);
  });

  it('should load the full-body carousel from the random muscles endpoint', () => {
    component.columns.set(3);
    component.rows.set(2);
    component.selectCategory('all');
    fixture.detectChanges();

    expect(workoutsServiceMock.getRandomMuscles).toHaveBeenCalled();
    expect(component.cardPages()[0].length).toBe(6);
    expect(component.cardPages().length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.classes__dot').length).toBe(2);
  });

  it('should reload localized muscle names when the language changes', () => {
    workoutsServiceMock.getMuscleGroups.mockClear();
    workoutsServiceMock.getRandomMuscles.mockClear();

    translationServiceMock.currentLang.set('ar');
    fixture.detectChanges();

    expect(workoutsServiceMock.getMuscleGroups).toHaveBeenCalled();
    expect(workoutsServiceMock.getRandomMuscles).toHaveBeenCalled();
  });

  it('should move the carousel when a pagination dot is clicked', () => {
    component.columns.set(3);
    component.rows.set(2);
    component.selectCategory('all');
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.classes__dot');
    dots[1].click();
    fixture.detectChanges();

    expect(component.currentSlide()).toBe(1);
  });
});
