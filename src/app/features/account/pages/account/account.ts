import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { BasicMetrics } from '../../components/basic-metrics/basic-metrics';

@Component({
  selector: 'app-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LanguageSwitcher, BasicMetrics],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {}
