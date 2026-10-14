import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Highly reusable card component featuring top media image with hover zoom,
 * frosted glassmorphism bottom panel, customizable title, and interactive CTA button.
 * Supports light/dark themes, RTL, keyboard accessibility, and custom actions.
 */
@Component({
  selector: 'app-reusable-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideArrowRight],
  templateUrl: './reusable-card.html',
  styleUrl: './reusable-card.scss',
  host: {
    class: 'block w-full',
  },
})
export class ReusableCard {
  private readonly router = inject(Router, { optional: true });

  /** Card title or i18n translation key (e.g. 'BREAKFAST', 'FITNESS CLASS') */
  readonly title = input.required<string>();

  /** Image asset path or URL */
  readonly image = input.required<string>();

  /** Optional accessible image alt text. Defaults to title if omitted. */
  readonly alt = input<string>('');

  /** CTA action label or i18n key. Defaults to 'REUSABLE_CARD.READ_MORE'. */
  readonly ctaLabel = input<string>('REUSABLE_CARD.READ_MORE');

  /** Optional router link path to navigate on click. */
  readonly actionUrl = input<string | null>(null);

  /** Emitted when the card or CTA is clicked or activated via keyboard. */
  readonly cardClick = output<void>();

  protected onCardClick(): void {
    this.cardClick.emit();
    const url = this.actionUrl();
    if (url && this.router) {
      void this.router.navigateByUrl(url);
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected onKeyDown(event: Event): void {
    event.preventDefault();
    this.onCardClick();
  }
}
