import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslationService } from '../../../../core/services/translation.service';
import { WorkoutsService } from '../../services/workouts.service';
import { Workouts } from './workouts';

describe('Workouts', () => {
  let fixture: ComponentFixture<Workouts>;
  let component: Workouts;

  const mockMuscleGroups = [
    { _id: 'grp-1', name: 'Chest' },
    { _id: 'grp-2', name: 'Shoulders' },
  ];

  const workoutsServiceMock = {
    defaultFeaturedWorkouts: [
      {
        id: 'group-workout',
        title: 'WORKOUTS.GROUP_WORKOUT',
        image: 'images/workouts-1.webp',
        alt: 'Group workout training in gym',
        category: 'Full Body',
      },
      {
        id: 'personal-training',
        title: 'WORKOUTS.PERSONAL_TRAINING',
        image: 'images/workouts-2.webp',
        alt: 'Personal fitness trainer coaching athlete',
        category: 'Full Body',
      },
      {
        id: 'muscle-building',
        title: 'WORKOUTS.MUSCLE_BUILDING',
        image: 'images/workouts-3.webp',
        alt: 'Athlete training on muscle building equipment',
        category: 'Full Body',
      },
    ],
    getMuscleGroups: vi.fn(() => of(mockMuscleGroups)),
    getRandomMuscles: vi.fn(() =>
      of([
        {
          _id: 'r1',
          name: 'Biceps Femoris',
          image: 'https://iili.io/33p7ww7.png',
        },
        {
          _id: 'r2',
          name: 'Rectus Abdominis',
          image: 'https://iili.io/33pYHNI.png',
        },
        {
          _id: 'r3',
          name: 'Posterior Deltoids',
          image: 'https://iili.io/33p7ene.png',
        },
      ]),
    ),
    getMusclesByGroupId: vi.fn((id: string) =>
      of([
        {
          _id: 'm1',
          name: 'Pectoralis Major',
          image: 'https://iili.io/33pYHNI.png',
        },
      ]),
    ),
  };

  const translationServiceMock = {
    direction: vi.fn(() => 'ltr'),
    translate: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'SECTION_TITLE.WORKOUTS.WATERMARK': 'WORKOUTS',
        'SECTION_TITLE.WORKOUTS.LABEL': 'Fitness Class',
        'WORKOUTS.TITLE_MAIN': 'TRANSFORM YOUR BODY WITH OUR',
        'WORKOUTS.TITLE_DYNAMIC': 'DYNAMIC',
        'WORKOUTS.TITLE_HIGHLIGHT': 'UPCOMING WORKOUTS',
        'WORKOUTS.FILTER_FULL_BODY': 'Full Body',
        'WORKOUTS.EXPLORE': 'Explore',
        'WORKOUTS.GROUP_WORKOUT': 'GROUP WORKOUT',
        'WORKOUTS.PERSONAL_TRAINING': 'PERSONAL TRAINING',
        'WORKOUTS.MUSCLE_BUILDING': 'MUSCLE BUILDING',
      };
      return map[key] ?? key;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Workouts],
      providers: [
        provideRouter([]),
        { provide: WorkoutsService, useValue: workoutsServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Workouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create Workouts component', () => {
    expect(component).toBeTruthy();
  });

  it('should render main headline with orange highlighted phrase', () => {
    const headline = fixture.nativeElement.querySelector('.workouts__headline');
    expect(headline).toBeTruthy();
    expect(headline.textContent).toContain('TRANSFORM YOUR BODY WITH OUR');
    expect(headline.querySelector('.text-orange-500')?.textContent?.trim()).toBe(
      'UPCOMING WORKOUTS',
    );
  });

  it('should render section title watermark and subtitle', () => {
    const sectionTitle = fixture.nativeElement.querySelector('app-section-title');
    expect(sectionTitle).toBeTruthy();
  });

  it('should render filter bar with Full Body active by default and dynamic groups', () => {
    const filterButtons = fixture.nativeElement.querySelectorAll('.workouts__filter-btn');
    expect(filterButtons.length).toBe(3); // 'Full Body' + 2 API groups
    expect(filterButtons[0].textContent.trim()).toBe('Full Body');
    expect(filterButtons[0].classList.contains('workouts__filter-btn--active')).toBe(true);

    expect(filterButtons[1].textContent.trim()).toBe('Chest');
    expect(filterButtons[2].textContent.trim()).toBe('Shoulders');
  });

  it('should filter items when category is selected', () => {
    component.selectCategory('grp-1');
    fixture.detectChanges();

    expect(workoutsServiceMock.getMusclesByGroupId).toHaveBeenCalledWith('grp-1');
    expect(component.activeCategory()).toBe('grp-1');
    expect(component.items().length).toBe(1);
    expect(component.items()[0].title).toBe('Pectoralis Major');
  });

  it('should fetch random muscles from API when Full Body category is selected', () => {
    component.selectCategory('grp-1');
    expect(component.items().length).toBe(1);

    component.selectCategory('all');
    expect(workoutsServiceMock.getRandomMuscles).toHaveBeenCalled();
    expect(component.activeCategory()).toBe('all');
    expect(component.items().length).toBe(3);
    expect(component.items()[0].title).toBe('Biceps Femoris');
  });

  it('should render cards and pagination dots', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-reusable-card');
    expect(cards.length).toBeGreaterThan(0);

    const dots = fixture.nativeElement.querySelectorAll('.workouts__dot');
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it('should switch slides when pagination dot is clicked', () => {
    component.itemsPerPage.set(1);
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.workouts__dot');
    expect(dots.length).toBeGreaterThan(1);

    dots[1].click();
    fixture.detectChanges();
    expect(component.currentSlide()).toBe(1);
  });
});
