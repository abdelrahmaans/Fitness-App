import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RightArrowIcon } from '../../ui/right-arrow-icon/right-arrow-icon';
import { SectionTitle } from '../../ui/section-title/section-title';

export interface AboutFeatureItem {
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'app-about-us-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionTitle, TranslatePipe, RouterLink, RightArrowIcon],
  templateUrl: './about-us-section.html',
})
export class AboutUsSection {
  readonly features: readonly AboutFeatureItem[] = [
    {
      titleKey: 'ABOUT.FEATURES.TRAINER.TITLE',
      descriptionKey: 'ABOUT.FEATURES.TRAINER.DESCRIPTION',
    },
    {
      titleKey: 'ABOUT.FEATURES.CARDIO.TITLE',
      descriptionKey: 'ABOUT.FEATURES.CARDIO.DESCRIPTION',
    },
    {
      titleKey: 'ABOUT.FEATURES.EQUIPMENT.TITLE',
      descriptionKey: 'ABOUT.FEATURES.EQUIPMENT.DESCRIPTION',
    },
    {
      titleKey: 'ABOUT.FEATURES.NUTRITION.TITLE',
      descriptionKey: 'ABOUT.FEATURES.NUTRITION.DESCRIPTION',
    },
  ];
}
