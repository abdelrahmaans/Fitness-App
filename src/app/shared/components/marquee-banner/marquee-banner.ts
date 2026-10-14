import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marquee-banner',
  imports: [CommonModule],
  templateUrl: './marquee-banner.html',
  styleUrl: './marquee-banner.scss',
})
export class MarqueeBanner {
  @Input() services: string[] = [
    'CLASSES',
    'OUTDOOR & ONLINE TRAINERS',
    'PERSONAL TRAINING',
    'LIVE CLASSES',
    'PERSONAL TRAINERS'
  ];
  @Input() animationSpeed: number = 25;
}
