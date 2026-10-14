import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { MarqueeBanner } from './marquee-banner';

describe('MarqueeBannerComponent', () => {
  let component: MarqueeBanner;
  let fixture: ComponentFixture<MarqueeBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueeBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(MarqueeBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should render default services array in marquee groups', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.marquee-group:first-child .marquee-item');

    expect(items.length).toBe(component.services.length);
    expect(items[0].textContent?.trim()).toBe('CLASSES');
    expect(items[1].textContent?.trim()).toBe('OUTDOOR & ONLINE TRAINERS');
  });

  it('should render customizable services when input is updated', () => {
    const customServices = ['HIIT', 'YOGA', 'PILATES'];
    fixture.componentRef.setInput('services', customServices);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.marquee-group:first-child .marquee-item');

    expect(items.length).toBe(customServices.length);
    expect(items[0].textContent?.trim()).toBe('HIIT');
    expect(items[1].textContent?.trim()).toBe('YOGA');
    expect(items[2].textContent?.trim()).toBe('PILATES');
  });

  it('should render four-pointed star icons (✦) between items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stars = compiled.querySelectorAll('.marquee-group:first-child .star-icon');

    expect(stars.length).toBe(component.services.length);
    expect(stars[0].textContent?.trim()).toBe('✦');
  });

  it('should duplicate content into a second group for infinite looping', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const groups = compiled.querySelectorAll('.marquee-group');

    // Asserts that two duplicate groups exist for seamless loop
    expect(groups.length).toBe(2);

    const secondaryItems = groups[1].querySelectorAll('.marquee-item');
    expect(secondaryItems.length).toBe(component.services.length);
  });

  it('should apply the animation duration style based on input', () => {
    fixture.componentRef.setInput('animationSpeed', 15);
    fixture.detectChanges();

    const trackElement = fixture.nativeElement.querySelector('.marquee-track') as HTMLElement;
    expect(trackElement.style.animationDuration).toBe('15s');
  });
});
