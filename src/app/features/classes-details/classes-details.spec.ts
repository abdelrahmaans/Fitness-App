import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ClassesDetails } from './classes-details';
import { ClassesDetailsService } from './services/classes-details.service';
import { Exercise } from './services/models/exercise.model';
import { MuscleGroup } from './services/models/muscle.model';

const mockMuscleGroups: MuscleGroup[] = [
  { _id: '69d982ed85f6bfa972bf2220', name: 'Chest' },
  { _id: '69d982ee85f6bfa972bf222c', name: 'Biceps' },
  { _id: '69d982ee85f6bfa972bf2226', name: 'Back' },
];

const mockPrimeMovers = [
  { _id: 'm1', name: 'Pectoralis Major', image: 'https://iili.io/33p7y9p.png' },
  { _id: 'm2', name: 'Anterior Deltoids', image: 'https://iili.io/33p7ene.png' },
];

const mockExercise: Exercise = {
  _id: 'ex1',
  exercise: 'Stability Ball Dead Bug',
  difficulty_level: 'Beginner',
  target_muscle_group: 'Chest',
  prime_mover_muscle: 'Pectoralis Major',
  short_youtube_demonstration_link: 'https://youtu.be/5jDEulwWs04',
};

const classesDetailsServiceMock = {
  getMuscleGroups: vi.fn().mockReturnValue(of(mockMuscleGroups)),
  getMusclesByGroupId: vi.fn().mockReturnValue(of([])),
  getPrimeMoverMusclesByGroupId: vi.fn().mockReturnValue(of(mockPrimeMovers)),
  getRandomPrimeMoverMuscles: vi.fn().mockReturnValue(of([])),
  getLevels: vi.fn().mockReturnValue(of([])),
  getLevelsByMuscleId: vi.fn().mockReturnValue(of([])),
  getAllExercises: vi
    .fn()
    .mockReturnValue(of({ message: 'success', totalExercises: 0, exercises: [] })),
  getExercisesByMuscleAndDifficulty: vi.fn().mockReturnValue(
    of({
      message: 'success',
      totalExercises: 1,
      exercises: [mockExercise],
    }),
  ),
  getRandomExercises: vi.fn().mockReturnValue(of([])),
};

describe('ClassesDetails', () => {
  let component: ClassesDetails;
  let fixture: ComponentFixture<ClassesDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesDetails],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClassesDetailsService, useValue: classesDetailsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load muscle groups from API on init', () => {
    expect(classesDetailsServiceMock.getMuscleGroups).toHaveBeenCalled();
    expect(component.muscleGroups().length).toBe(mockMuscleGroups.length);
  });

  it('should set the first muscle group as active category by default', () => {
    expect(component.activeCategory()).toBe(mockMuscleGroups[0]._id);
  });

  it('should load prime mover muscles for the first group on init', () => {
    expect(classesDetailsServiceMock.getPrimeMoverMusclesByGroupId).toHaveBeenCalledWith(
      mockMuscleGroups[0]._id,
    );
    expect(component.primeMoverMuscles().length).toBe(2);
    expect(component.activePrimeMoverMuscleId()).toBe('m1');
  });

  it('should render all category buttons from API data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryBtns = compiled.querySelectorAll('.classes-details__category-btn');
    expect(categoryBtns.length).toBe(mockMuscleGroups.length);
  });

  it('should render prime mover buttons when multiple prime movers are available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const primeMoverBtns = compiled.querySelectorAll('.classes-details__prime-mover-btn');
    expect(primeMoverBtns.length).toBe(2);
    expect(primeMoverBtns[0].textContent).toContain('Pectoralis Major');
  });

  it('should switch active prime mover muscle on button click', () => {
    component.selectPrimeMoverMuscle('m2');
    expect(component.activePrimeMoverMuscleId()).toBe('m2');
  });

  it('should update activeCategory on selectCategory call', () => {
    component.selectCategory(mockMuscleGroups[2]._id);
    expect(component.activeCategory()).toBe(mockMuscleGroups[2]._id);
  });

  it('should mark the active category button with the active class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const activeBtn = compiled.querySelector('.classes-details__category-btn--active');
    expect(activeBtn).toBeTruthy();
    expect(activeBtn?.textContent?.trim()).toBe(mockMuscleGroups[0].name);
  });

  it('should update selectedExercise when onSelectExercise is called', () => {
    component.onSelectExercise(mockExercise);
    expect(component.selectedExercise()).toEqual(mockExercise);
  });

  it('should reload exercises when onLevelChange is called', () => {
    const spy = vi.spyOn(component, 'loadExercises');
    component.onLevelChange('level_novice');
    expect(component.activeLevelId()).toBe('level_novice');
    expect(spy).toHaveBeenCalled();
  });

  it('should render all workout badges using @for with right-arrow-white icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badgeElements = compiled.querySelectorAll('.classes-details__badge');
    expect(badgeElements.length).toBe(component.badges().length);

    const icons = compiled.querySelectorAll('.classes-details__badge-arrow');
    expect(icons.length).toBe(component.badges().length);
    icons.forEach((icon) => {
      expect((icon as HTMLImageElement).getAttribute('src')).toBe('/images/right-arrow-white.png');
    });
  });

  it('should accept targetMuscleId in selectCategory and set activePrimeMoverMuscleId', () => {
    component.selectCategory(mockMuscleGroups[0]._id, 'm2');
    expect(component.activePrimeMoverMuscleId()).toBe('m2');
  });
});
