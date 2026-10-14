import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkoutsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(WorkoutsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created and have default featured workouts', () => {
    expect(service).toBeTruthy();
    expect(service.defaultFeaturedWorkouts.length).toBe(3);
    expect(service.defaultFeaturedWorkouts[0].title).toBe('WORKOUTS.GROUP_WORKOUT');
  });

  it('should fetch muscle groups from API', () => {
    const mockGroups = [
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

  it('should fetch muscles by muscle group ID from API', () => {
    const mockMuscles = [
      { _id: 'm1', name: 'Rectus Abdominis', image: 'https://iili.io/33pYHNI.png' },
    ];

    service.getMusclesByGroupId('1').subscribe((muscles) => {
      expect(muscles.length).toBe(1);
      expect(muscles[0].name).toBe('Rectus Abdominis');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/musclesGroup/1`);
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      muscleGroup: { _id: '1', name: 'Abdominals' },
      muscles: mockMuscles,
    });
  });

  it('should gracefully handle API error and return empty array', () => {
    service.getMuscleGroups().subscribe((groups) => {
      expect(groups).toEqual([]);
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/muscles`);
    req.error(new ProgressEvent('Network error'));
  });

  it('should fetch 20 random muscles from API', () => {
    const mockMuscles = [
      { _id: 'r1', name: 'Biceps Femoris', image: 'https://iili.io/33p7ww7.png' },
    ];

    service.getRandomMuscles().subscribe((muscles) => {
      expect(muscles.length).toBe(1);
      expect(muscles[0].name).toBe('Biceps Femoris');
    });

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/muscles/random`);
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'success',
      totalMuscles: 1,
      muscles: mockMuscles,
    });
  });
});
