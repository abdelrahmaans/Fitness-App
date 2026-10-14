import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from '../../../../layout/main/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { HealthyNutrition } from '../../components/healthy-nutrition/healthy-nutrition';
import { WhyUs } from '../../components/why-us/why-us';
import { Workouts } from '../../components/workouts/workouts';
import { MarqueeBanner } from '../../../../shared/components/marquee-banner/marquee-banner';
import { AboutUsSection } from '../../../../shared/sections/about-us-section/about-us-section';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Navbar,
    Hero,
    LanguageSwitcher,
    MarqueeBanner,
    HealthyNutrition,
    WhyUs,
    AboutUsSection,
    Workouts,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
