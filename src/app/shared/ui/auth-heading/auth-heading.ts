import { Component, input } from '@angular/core';
import { resolveAuthHeadingStep } from '../../utils/auth-heading-step';
import { AuthHeadingStep } from '../auth-heading-step/auth-heading-step';

/**
 * Auth page title stack above the form card.
 *
 * Cases (set only the inputs you need):
 * - Login / register: `lead` + `headline`
 * - Onboarding step: `step` + `headline` + `support`
 * - Forgot password: `headline` only
 */
@Component({
  selector: 'app-auth-heading',
  imports: [AuthHeadingStep],
  templateUrl: './auth-heading.html',
  styleUrl: './auth-heading.scss',
})
export class AuthHeading {
  readonly lead = input<string>();
  readonly step = input<string>();
  readonly headline = input.required<string>();
  readonly support = input<string>();

  protected readonly resolveStep = resolveAuthHeadingStep;
}
