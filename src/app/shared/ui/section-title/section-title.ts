import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

export type SectionTitleAlign = 'start' | 'center';

/** Large gradient watermark (main title) + orange subtitle row with dumbbell icon. */
@Component({
  selector: 'app-section-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './section-title.html',
  host: {
    class: 'block w-full max-w-full overflow-visible',
  },
})
export class SectionTitle {
  /** i18n key for large outline text (e.g. SECTION_TITLE.HEALTHY.WATERMARK). */
  readonly backgroundTitleKey = input.required<string>();

  /** i18n key for orange subtitle; omit for watermark-only sections. */
  readonly labelKey = input<string>();

  readonly align = input<SectionTitleAlign>('start');
}
