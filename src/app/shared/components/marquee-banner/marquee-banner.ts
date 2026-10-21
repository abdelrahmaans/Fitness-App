import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-marquee-banner',
  templateUrl: './marquee-banner.html',
  styleUrl: './marquee-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeBanner {
  readonly services = input<string[]>([
    'CLASSES',
    'OUTDOOR & ONLINE TRAINERS',
    'PERSONAL TRAINING',
    'LIVE CLASSES',
    'PERSONAL TRAINERS',
  ]);

  readonly animationSpeed = input<number>(25);

  /** Base number of times the services list is repeated within each marquee group */
  readonly repeatCount = input<number>(3);

  /**
   * Repeated services array ensuring each group spans wider than the viewport (> 2000px)
   * to provide seamless infinite scrolling without gaps or text interruptions on wide screens.
   */
  readonly repeatedServices = computed(() => {
    const items = this.services();
    if (!items.length) return [];

    const baseRepeat = Math.max(1, this.repeatCount());
    const minItemsNeeded = 10;
    const autoMultiplier = Math.ceil(minItemsNeeded / items.length);
    const multiplier = Math.max(baseRepeat, autoMultiplier);

    return Array.from({ length: multiplier }, () => items).flat();
  });
}
