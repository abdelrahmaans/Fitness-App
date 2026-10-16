import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Exercise } from '../../services/models/exercise.model';
import { MainVideo } from './main-video';

const mockExercise: Exercise = {
  _id: '69d982f285f6bfa972bf227c',
  exercise: 'Stability Ball Dead Bug',
  difficulty_level: 'Beginner',
  target_muscle_group: 'Abdominals',
  prime_mover_muscle: 'Rectus Abdominis',
  primary_equipment: 'Stability Ball',
  posture: 'Supine',
  mechanics: 'Compound',
  movement_pattern_1: 'Anti-Extension',
  short_youtube_demonstration_link: 'https://youtu.be/5jDEulwWs04',
  in_depth_youtube_explanation_link: 'https://youtu.be/Sa4ZWmnSC5o',
};

describe('MainVideo', () => {
  let component: MainVideo;
  let fixture: ComponentFixture<MainVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainVideo],
    }).compileComponents();

    fixture = TestBed.createComponent(MainVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title and description when exercise input is null', () => {
    expect(component.title()).toBe('Featured Workout');
    const title = fixture.nativeElement.querySelector('.main-video__title');
    expect(title?.textContent?.trim()).toBe('Featured Workout');
  });

  it('should update title, description, and badges when exercise input is provided', () => {
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.detectChanges();

    expect(component.title()).toBe('Stability Ball Dead Bug');
    expect(component.difficultyBadge()).toBe('Beginner');
    expect(component.equipmentBadge()).toBe('Stability Ball');
    expect(component.postureBadge()).toBe('Supine');

    const title = fixture.nativeElement.querySelector('.main-video__title');
    expect(title?.textContent?.trim()).toBe('Stability Ball Dead Bug');
  });

  it('should compute YouTube thumbnail for exercise with demonstration link', () => {
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.detectChanges();

    expect(component.thumbnail()).toBe('https://img.youtube.com/vi/5jDEulwWs04/hqdefault.jpg');
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.main-video__thumbnail');
    expect(img.getAttribute('src')).toBe('https://img.youtube.com/vi/5jDEulwWs04/hqdefault.jpg');
  });

  it('should activate embedded player when onPlayVideo is called with embedUrl', () => {
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.detectChanges();

    expect(component.isPlaying()).toBe(false);
    component.onPlayVideo();
    expect(component.isPlaying()).toBe(true);

    fixture.detectChanges();
    const iframe = fixture.nativeElement.querySelector('.main-video__iframe');
    expect(iframe).toBeTruthy();

    const closeBtn = fixture.nativeElement.querySelector('.main-video__close-btn');
    expect(closeBtn).toBeTruthy();

    component.onCloseVideo();
    expect(component.isPlaying()).toBe(false);
  });

  it('should render 3 metadata badges in preview mode', () => {
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.main-video__badge');
    expect(badges.length).toBe(3);
  });

  it('should play video when preview area is clicked', () => {
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.detectChanges();

    const preview: HTMLElement = fixture.nativeElement.querySelector('.main-video__preview');
    expect(preview).toBeTruthy();
    preview.click();

    expect(component.isPlaying()).toBe(true);
  });

  it('should reset isPlaying to false when exercise changes to prevent autoplay', () => {
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.detectChanges();

    component.onPlayVideo();
    expect(component.isPlaying()).toBe(true);

    // Switch to a new exercise
    const newExercise: Exercise = {
      ...mockExercise,
      _id: 'new_ex_2',
      exercise: 'Incline Push Up',
    };
    fixture.componentRef.setInput('exercise', newExercise);
    fixture.detectChanges();

    expect(component.isPlaying()).toBe(false);
  });
});
