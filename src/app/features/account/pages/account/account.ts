import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from '../../../../layout/main/navbar/navbar';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { BasicMetrics } from '../../components/basic-metrics/basic-metrics';

@Component({
  selector: 'app-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Navbar, LanguageSwitcher, BasicMetrics],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {}
