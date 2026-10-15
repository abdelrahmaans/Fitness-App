import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from '../../../../layout/main/navbar/navbar';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Navbar, LanguageSwitcher],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account {}
