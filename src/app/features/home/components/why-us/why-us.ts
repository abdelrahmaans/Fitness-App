import { Component } from '@angular/core';
import { SectionTitle } from '../../../../shared/ui/section-title/section-title';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-why-us',
  imports: [SectionTitle,TranslatePipe],
  templateUrl: './why-us.html',
  styleUrl: './why-us.scss',
})
export class WhyUs {}
