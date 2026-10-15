import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { MarqueeBanner } from '../../../shared/components/marquee-banner/marquee-banner';
import { Footer } from '../../../shared/ui/footer/footer';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Navbar, MarqueeBanner, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  readonly bottomBannerServices = [
    'HIIT & CARDIO',
    'CROSSFIT ZONE',
    'NUTRITION CONSULTING',
    'YOGA & PILATES',
  ];
}
