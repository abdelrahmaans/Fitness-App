import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from '../../../../layout/main/navbar/navbar';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { AboutUsSection } from '../../../../shared/sections/about-us-section/about-us-section';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Navbar, AboutUsSection, LanguageSwitcher],
  templateUrl: './about.html',
})
export class About {}
