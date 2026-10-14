import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type RightArrowVariant = 'orange' | 'white';

/** Brand arrow: up-right in LTR, up-left in RTL. Use `white` on orange CTAs. */
@Component({
  selector: 'app-right-arrow-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 items-center justify-center' },
  template: `
    <img
      class="block h-auto w-auto origin-center object-contain object-center [transform:rotate(-45deg)] rtl:[transform:rotate(-135deg)]"
      [class]="sizeClass()"
      [src]="src()"
      alt=""
      width="24"
      height="24"
      aria-hidden="true"
    />
  `,
})
export class RightArrowIcon {
  readonly sizeClass = input<string>('size-5');

  /** `white` for solid orange CTAs; default `orange` elsewhere. */
  readonly variant = input<RightArrowVariant>('orange');

  protected readonly src = computed(() =>
    this.variant() === 'white' ? 'images/right-arrow-white.png' : 'images/right-arrow.png',
  );
}
