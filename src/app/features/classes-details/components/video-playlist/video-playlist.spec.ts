import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ClassesDetailsService } from '../../services/classes-details.service';
import { Exercise } from '../../services/models/exercise.model';
import { Level } from '../../services/models/level.model';
import { Muscle } from '../../services/models/muscle.model';
import { VideoPlaylist } from './video-playlist';

const mockMuscles: Muscle[] = [
  { _id: 'm1', name: 'Rectus Abdominis', image: 'https://iili.io/33pYHNI.png' },
  { _id: 'm2', name: 'Obliques', image: 'https://iili.io/33p7mSR.png' },
];

const mockLevels: Level[] = [
  { id: 'l1', name: 'Beginner' },
  { id: 'l2', name: 'Intermediate' },
  { id: 'l3', name: 'Advanced' },
  { id: 'l4', name: 'Expert' },
];

const mockMuscleLevels: Level[] = [
  { id: 'l1', name: 'Beginner' },
  { id: 'l2', name: 'Intermediate' },
];

const mockExercises: Exercise[] = [
  {
    _id: 'ex1',
    exercise: 'Stability Ball Dead Bug',
    difficulty_level: 'Beginner',
    target_muscle_group: 'Abdominals',
    prime_mover_muscle: 'Rectus Abdominis',
    primary_equipment: 'Stability Ball',
    posture: 'Supine',
    mechanics: 'Compound',
    short_youtube_demonstration_link: 'https://youtu.be/5jDEulwWs04',
  },
  {
    _id: 'ex2',
    exercise: 'Bodyweight Bird Dog',
    difficulty_level: 'Beginner',
    target_muscle_group: 'Abdominals',
    prime_mover_muscle: 'Rectus Abdominis',
    primary_equipment: 'Bodyweight',
    posture: 'Quadruped',
    mechanics: 'Compound',
    short_youtube_demonstration_link: 'https://youtu.be/tU-WZsouVjo?si=Ti1JUU03OqgnmtX6',
  },
];

describe('VideoPlaylist', () => {
  let component: VideoPlaylist;
  let fixture: ComponentFixture<VideoPlaylist>;
  let mockService: {
    getLevels: ReturnType<typeof vi.fn>;
    getLevelsByMuscleId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      getLevels: vi.fn().mockReturnValue(of(mockLevels)),
      getLevelsByMuscleId: vi.fn().mockReturnValue(of(mockMuscleLevels)),
    };

    await TestBed.configureTestingModule({
      imports: [VideoPlaylist],
      providers: [{ provide: ClassesDetailsService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlaylist);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all levels from service initially and set first level active', () => {
    expect(mockService.getLevels).toHaveBeenCalled();
    expect(component.levels().length).toBe(4);
    expect(component.activeLevelId()).toBe('l1');
  });

  it('should render all level tabs dynamically in template', () => {
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.video-playlist__tab');
    expect(tabs.length).toBe(4);
    expect(tabs[0].textContent.trim()).toBe('Beginner');
    expect(tabs[1].textContent.trim()).toBe('Intermediate');
  });

  it('should switch active level and emit levelChange when selectLevel is called', () => {
    const emitSpy = vi.fn();
    component.levelChange.subscribe(emitSpy);

    component.selectLevel('l2');
    expect(component.activeLevelId()).toBe('l2');
    expect(emitSpy).toHaveBeenCalledWith('l2');
  });

  it('should highlight active tab with the active CSS class', () => {
    fixture.detectChanges();
    const activeTab = fixture.nativeElement.querySelector('.video-playlist__tab--active');
    expect(activeTab).toBeTruthy();
    expect(activeTab.textContent.trim()).toBe('Beginner');
  });

  it('should load muscle-specific levels when primeMoverMuscleId input is set', async () => {
    fixture.componentRef.setInput('primeMoverMuscleId', '69d982ef85f6bfa972bf2248');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockService.getLevelsByMuscleId).toHaveBeenCalledWith('69d982ef85f6bfa972bf2248');
    expect(component.levels().length).toBe(2);
  });

  it('should display default playlist items when no exercises or muscles input provided', () => {
    expect(component.playlistItems().length).toBe(8);
  });

  it('should map exercises input to playlist items with YouTube thumbnails', () => {
    fixture.componentRef.setInput('exercises', mockExercises);
    fixture.detectChanges();

    const items = component.playlistItems();
    expect(items.length).toBe(2);
    expect(items[0].title).toBe('Stability Ball Dead Bug');
    expect(items[0].thumbnail).toBe('https://img.youtube.com/vi/5jDEulwWs04/hqdefault.jpg');
    expect(items[0].groups).toContain('Stability Ball');
  });

  it('should highlight selected exercise when selectedExerciseId matches', () => {
    fixture.componentRef.setInput('exercises', mockExercises);
    fixture.componentRef.setInput('selectedExerciseId', 'ex1');
    fixture.detectChanges();

    const selectedItem = fixture.nativeElement.querySelector(
      '.video-playlist__item--selected',
    );
    expect(selectedItem).toBeTruthy();
    expect(selectedItem.textContent).toContain('Stability Ball Dead Bug');
  });

  it('should emit exerciseSelect and itemSelect when a playlist item is clicked', () => {
    fixture.componentRef.setInput('exercises', mockExercises);
    fixture.detectChanges();

    const itemSpy = vi.fn();
    const exerciseSpy = vi.fn();
    component.itemSelect.subscribe(itemSpy);
    component.exerciseSelect.subscribe(exerciseSpy);

    const firstItem = fixture.nativeElement.querySelector('.video-playlist__item');
    firstItem.click();

    expect(itemSpy).toHaveBeenCalledWith(component.playlistItems()[0]);
    expect(exerciseSpy).toHaveBeenCalledWith(mockExercises[0]);
  });
});
