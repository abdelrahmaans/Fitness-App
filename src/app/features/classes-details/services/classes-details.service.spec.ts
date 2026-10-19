import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ClassesDetailsService } from './classes-details.service';
import { MuscleGroup } from './models/muscle.model';

describe('ClassesDetailsService', () => {
  let service: ClassesDetailsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClassesDetailsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ClassesDetailsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch muscle groups from GET /muscles', () => {
    const mockGroups: MuscleGroup[] = [
      { _id: '1', name: 'Abdominals' },
      { _id: '2', name: 'Chest' },
    ];

    service.getMuscleGroups().subscribe((groups) => {
      expect(groups.length).toBe(2);
      expect(groups[0].name).toBe('Abdominals');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/muscles`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'success', musclesGroup: mockGroups });
  });

  it('should return empty array on getMuscleGroups error', () => {
    service.getMuscleGroups().subscribe((groups) => {
      expect(groups).toEqual([]);
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/muscles`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fetch muscles by group ID from GET /musclesGroup/:id', () => {
    const groupId = '69d982ed85f6bfa972bf2218';

    service.getMusclesByGroupId(groupId).subscribe((muscles) => {
      expect(muscles.length).toBe(2);
      expect(muscles[0].name).toBe('Rectus Abdominis');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/musclesGroup/${groupId}`);
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      muscleGroup: { _id: groupId, name: 'Abdominals' },
      muscles: [
        { _id: 'm1', name: 'Rectus Abdominis', image: 'https://iili.io/33pYHNI.png' },
        { _id: 'm2', name: 'Obliques', image: 'https://iili.io/33p7mSR.png' },
      ],
    });
  });

  it('should return empty array on getMusclesByGroupId error', () => {
    service.getMusclesByGroupId('invalid').subscribe((muscles) => {
      expect(muscles).toEqual([]);
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/musclesGroup/invalid`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should fetch levels from GET /levels and map _id to id', () => {
    service.getLevels().subscribe((levels) => {
      expect(levels.length).toBe(2);
      expect(levels[0]).toEqual({ id: '69d982ed85f6bfa972bf2216', name: 'Beginner' });
      expect(levels[1]).toEqual({ id: '69d982ed85f6bfa972bf221c', name: 'Intermediate' });
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/levels`);
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      levels: [
        { _id: '69d982ed85f6bfa972bf2216', name: 'Beginner' },
        { _id: '69d982ed85f6bfa972bf221c', name: 'Intermediate' },
      ],
    });
  });

  it('should return empty array on getLevels error', () => {
    service.getLevels().subscribe((levels) => {
      expect(levels).toEqual([]);
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/levels`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fetch difficulty levels by prime mover muscle ID', () => {
    const muscleId = '69d982ef85f6bfa972bf2248';

    service.getLevelsByMuscleId(muscleId).subscribe((levels) => {
      expect(levels.length).toBe(2);
      expect(levels[0]).toEqual({ id: '69d982ed85f6bfa972bf2216', name: 'Beginner' });
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/levels/difficulty-levels/by-prime-mover` &&
        r.params.get('primeMoverMuscleId') === muscleId,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalLevels: 2,
      difficulty_levels: [
        { id: '69d982ed85f6bfa972bf2216', name: 'Beginner' },
        { id: '69d982ed85f6bfa972bf221c', name: 'Intermediate' },
      ],
    });
  });

  it('should return empty array on getLevelsByMuscleId error', () => {
    service.getLevelsByMuscleId('invalid').subscribe((levels) => {
      expect(levels).toEqual([]);
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/levels/difficulty-levels/by-prime-mover` &&
        r.params.get('primeMoverMuscleId') === 'invalid',
    );
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should fetch 20 random prime mover muscles from GET /muscles/random', () => {
    service.getRandomPrimeMoverMuscles().subscribe((muscles) => {
      expect(muscles.length).toBe(1);
      expect(muscles[0].name).toBe('Serratus Anterior');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/muscles/random`);
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalMuscles: 1,
      muscles: [{ _id: 'm_random_1', name: 'Serratus Anterior', image: null }],
    });
  });

  it('should fetch prime mover muscles by group ID from GET /musclesGroup/by-muscle-group', () => {
    const groupId = '69d982ed85f6bfa972bf2218';

    service.getPrimeMoverMusclesByGroupId(groupId).subscribe((muscles) => {
      expect(muscles.length).toBe(2);
      expect(muscles[0].name).toBe('Rectus Abdominis');
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/musclesGroup/by-muscle-group` &&
        r.params.get('muscleGroupId') === groupId,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalMuscles: 2,
      muscles: [
        { _id: '69d982ef85f6bfa972bf2248', name: 'Rectus Abdominis', image: 'https://iili.io/33pYHNI.png' },
        { _id: '69d982ef85f6bfa972bf224c', name: 'Obliques', image: 'https://iili.io/33p7mSR.png' },
      ],
    });
  });

  it('should fetch all exercises from GET /exercises with pagination', () => {
    service.getAllExercises(1, 10).subscribe((res) => {
      expect(res.totalExercises).toBe(2990);
      expect(res.exercises.length).toBe(1);
      expect(res.exercises[0].exercise).toBe('Stability Ball Dead Bug');
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/exercises` &&
        r.params.get('page') === '1' &&
        r.params.get('limit') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalExercises: 2990,
      totalPages: 299,
      currentPage: 1,
      exercises: [
        {
          _id: 'ex1',
          exercise: 'Stability Ball Dead Bug',
          difficulty_level: 'Beginner',
          target_muscle_group: 'Abdominals',
          prime_mover_muscle: 'Rectus Abdominis',
        },
      ],
    });
  });

  it('should fetch exercises by muscle and difficulty level', () => {
    const muscleId = '69d982ef85f6bfa972bf2248';
    const levelId = '69d982ed85f6bfa972bf2216';

    service.getExercisesByMuscleAndDifficulty(muscleId, levelId).subscribe((res) => {
      expect(res.exercises.length).toBe(1);
      expect(res.exercises[0].exercise).toBe('Stability Ball Dead Bug');
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/exercises/by-muscle-difficulty` &&
        r.params.get('primeMoverMuscleId') === muscleId &&
        r.params.get('difficultyLevelId') === levelId,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalExercises: 12,
      totalPages: 2,
      currentPage: 1,
      exercises: [
        {
          _id: 'ex1',
          exercise: 'Stability Ball Dead Bug',
          difficulty_level: 'Beginner',
          target_muscle_group: 'Abdominals',
          prime_mover_muscle: 'Rectus Abdominis',
          short_youtube_demonstration_link: 'https://youtu.be/5jDEulwWs04',
        },
      ],
    });
  });

  it('should fetch random exercises for a muscle group and difficulty', () => {
    const groupId = '69d982ed85f6bfa972bf2218';
    const levelId = '69d982ed85f6bfa972bf2216';

    service.getRandomExercises(groupId, levelId, 5).subscribe((exercises) => {
      expect(exercises.length).toBe(1);
      expect(exercises[0].exercise).toBe('Stability Ball Russian Twist');
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiBaseUrl}/exercises/random` &&
        r.params.get('targetMuscleGroupId') === groupId &&
        r.params.get('difficultyLevelId') === levelId &&
        r.params.get('limit') === '5',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalExercises: 5,
      exercises: [
        {
          _id: 'ex_rnd_1',
          exercise: 'Stability Ball Russian Twist',
          difficulty_level: 'Beginner',
          target_muscle_group: 'Abdominals',
          prime_mover_muscle: 'Obliques',
        },
      ],
    });
  });
});
