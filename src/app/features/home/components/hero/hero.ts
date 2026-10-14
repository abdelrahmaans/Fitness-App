import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RightArrowIcon } from '../../../../shared/ui/right-arrow-icon/right-arrow-icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface HeroStat {
  readonly valueKey: string;
  readonly labelKey: string;
}

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, RightArrowIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  /** Key fitness statistics displayed in hero */
  readonly stats: readonly HeroStat[] = [
    {
      valueKey: 'HERO.MEMBERS_COUNT',
      labelKey: 'HERO.MEMBERS_LABEL',
    },
    {
      valueKey: 'HERO.TRAINERS_COUNT',
      labelKey: 'HERO.TRAINERS_LABEL',
    },
    {
      valueKey: 'HERO.EXPERIENCE_COUNT',
      labelKey: 'HERO.EXPERIENCE_LABEL',
    },
  ];
}
